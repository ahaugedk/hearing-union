#!/usr/bin/env python3
"""Kontrollér startpakkens lokale OKF-profil uden eksterne afhængigheder."""
import argparse
from collections import defaultdict
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


def documents(root):
    for base, directories, files in os.walk(root / 'docs'):
        base = Path(base)
        if base == root / 'docs' / 'roadmap':
            directories[:] = [name for name in directories if name != 'parkeret']
        for name in sorted(files):
            if name.endswith('.md'):
                yield base / name


def frontmatter(text):
    lines = text.splitlines()
    if not lines or lines[0] != '---':
        return {}, text
    try:
        end = lines.index('---', 1)
    except ValueError:
        raise ValueError('Frontmatter mangler afsluttende ---')
    metadata = {}
    for line in lines[1:end]:
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        match = re.fullmatch(r'([A-Za-z_][A-Za-z_0-9-]*):\s*(.+)', line)
        if not match:
            raise ValueError('Denne profil bruger én skalar pr. metadatalinje')
        key, value = match.groups()
        if key in metadata:
            raise ValueError('Dubleret metadatafelt: ' + key)
        if value.startswith('"'):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as error:
                raise ValueError('Ugyldig citeret skalar: ' + key) from error
        elif value.startswith("'"):
            if not value.endswith("'") or len(value) < 2:
                raise ValueError('Uafsluttet citeret skalar: ' + key)
            value = value[1:-1].replace("''", "'")
        elif ': ' in value or value.startswith(('[', '{', '|', '>')):
            raise ValueError('Brug en citeret skalar i dette felt: ' + key)
        if not isinstance(value, str) or not value.strip():
            raise ValueError('Tom eller ikke-tekstlig skalar: ' + key)
        metadata[key] = value
    return metadata, '\n'.join(lines[end + 1:])


def prose(text):
    result = []
    fence = None
    for line in text.splitlines():
        match = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
        if match:
            marker = match.group(1)
            if fence is None:
                fence = marker
            elif marker[0] == fence[0] and len(marker) >= len(fence):
                fence = None
            continue
        if fence is None and not line.startswith(('    ', '\t')):
            result.append(line)
    return '\n'.join(result)


def anchors(body):
    found = set()
    counts = defaultdict(int)
    for line in prose(body).splitlines():
        match = re.match(r'^#{1,6}\s+(.+?)(?:\s+#+)?$', line)
        if not match:
            continue
        title = re.sub(r'\[([^]]+)\]\([^)]*\)', r'\1', match.group(1))
        slug = re.sub(r'[^\w\- ]', '', title.lower()).replace(' ', '-')
        number = counts[slug]
        counts[slug] += 1
        found.add(slug + ('-' + str(number) if number else ''))
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    errors = []
    data = {}
    roles = defaultdict(set)
    paths = list(documents(root))
    for name in ('README.md', 'AGENTS.md'):
        if (root / name).is_file():
            paths.append(root / name)

    def error(path, message):
        errors.append(str(path.relative_to(root)) + ': ' + message)

    if not (root / 'docs' / 'index.md').is_file():
        errors.append('docs/index.md mangler')
    for path in paths:
        try:
            metadata, body = frontmatter(path.read_text(encoding='utf-8'))
        except (ValueError, UnicodeError) as problem:
            error(path, str(problem))
            continue
        data[path] = (metadata, body)
        relative = path.relative_to(root)
        if relative == Path('docs/index.md'):
            if metadata != {'okf_version': '0.2'}:
                error(path, 'Rodindekset skal erklære okf_version: "0.2"')
        elif relative.parts[0] == 'docs':
            if path.name == 'index.md':
                if metadata:
                    error(path, 'Underindeks har ingen frontmatter i denne profil')
            else:
                for key in ('type', 'title', 'description', 'status'):
                    if not metadata.get(key):
                        error(path, 'Mangler metadata: ' + key)
                if metadata.get('status') not in ('draft', 'stable'):
                    error(path, 'Dokumentstatus skal være draft eller stable')
        if metadata.get('role') or metadata.get('plan'):
            role = metadata.get('role')
            expected = {'vision': 'Plan Vision', 'scenarios': 'Plan Scenarios',
                        'implementation': 'Plan Implementation'}
            if role not in expected or not metadata.get('plan'):
                error(path, 'Planblade skal have plan-id og gyldig role')
            elif metadata.get('type') != expected[role]:
                error(path, 'type svarer ikke til role')
            else:
                owner = next((Path(*relative.parts[:i + 2])
                              for i, part in enumerate(relative.parts[:-1])
                              if part in ('roadmap', 'skabeloner')), relative.parent)
                roles[(owner, metadata['plan'])].add(role)

    links = defaultdict(set)
    for path, (_, body) in data.items():
        for match in re.finditer(r'(?<!!)\[[^\]\n]+\]\(([^)\n]+)\)', prose(body)):
            href = match.group(1).strip().strip('<>')
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            if url.path.startswith('/'):
                error(path, 'Brug et relativt lokalt link: ' + href)
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if not target.is_relative_to(root):
                error(path, 'Link peger uden for projektet: ' + href)
                continue
            if target.is_relative_to(root / 'docs' / 'roadmap' / 'parkeret'):
                error(path, 'Aktiv tekst linker til parkeret materiale: ' + href)
                continue
            links[path].add(target)
            if not target.exists():
                error(path, 'Brudt lokalt link: ' + href)
            elif url.fragment and target.suffix == '.md':
                target_body = data.get(target, ({}, ''))[1]
                if unquote(url.fragment) not in anchors(target_body):
                    error(path, 'Ukendt anker: ' + href)

    for path in data:
        if path.name != 'index.md':
            continue
        for child in path.parent.iterdir():
            if child == root / 'docs' / 'roadmap' / 'parkeret':
                continue
            target = child / 'index.md' if child.is_dir() else child
            if child.is_dir() and not target.is_file():
                error(path, 'Undermappe mangler index.md: ' + child.name)
            elif target.suffix == '.md' and target != path and target not in links[path]:
                error(path, 'Direkte barn mangler link i indeksprosa: ' + str(target.relative_to(path.parent)))

    # Hver faktisk plan skal indeholde alle tre roller med samme plan-id.
    for directory in (root / 'docs' / 'roadmap').iterdir():
        if not directory.is_dir() or directory.name == 'parkeret':
            continue
        if not (directory / 'index.md').is_file():
            errors.append('docs/roadmap/' + directory.name + ': planindeks mangler')
        for name, role in (('vision.md', 'vision'), ('scenarier.md', 'scenarios'),
                           ('implementering.md', 'implementation')):
            path = directory / name
            metadata = data.get(path, ({}, ''))[0]
            if metadata.get('role') != role or metadata.get('plan') != directory.name:
                errors.append('docs/roadmap/' + directory.name + '/' + name + ': mangler eller har forkert plan-id/rolle')
    for (owner, plan), present in roles.items():
        if present != {'vision', 'scenarios', 'implementation'}:
            errors.append(str(owner) + ': plan ' + plan + ' mangler en af de tre roller')

    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print('OK: metadata, lokale links, ankre, indeksnavigation og planroller.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
