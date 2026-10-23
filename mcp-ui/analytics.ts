import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { OpenAIExtensions } from '@openai/mcp-extensions/app';

type Group = 'date' | 'tool' | 'topic' | 'outcome';
type Report = {
  from: string; to: string; groupBy: Group; unit: 'calls' | 'topic_interactions'; minimumTopicCount: number;
  items: { key: string; label: string; count: number }[]; total: number; description: string;
};
const app = new App({ name: 'Høreforeningens brugsstatistik', version: '0.1.0' });
new OpenAIExtensions(app);
const style = document.createElement('style');
style.textContent = `body{font:16px system-ui;color:var(--color-text-primary,#18232d);background:var(--color-background-primary,#fff);margin:16px}*{box-sizing:border-box}form{display:flex;flex-wrap:wrap;gap:12px;align-items:end}label{display:grid;gap:4px}input,select,button{font:inherit;padding:9px;max-width:100%}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #176db0;outline-offset:2px}button:disabled{opacity:.6}#analytics-status{min-height:1.5em}#analytics-summary{font-size:1.5rem;font-weight:700;margin-block:20px}table{width:100%;border-collapse:collapse;margin-block:16px}table{font-size:.95rem}th,td{text-align:left;padding:10px 4px;border-bottom:1px solid #89939d;overflow-wrap:anywhere}td{text-align:right}thead th{hyphens:auto}th:first-child{width:40%}caption{text-align:left;font-weight:600;margin-block:12px}.bar-row{display:grid;grid-template-columns:minmax(0,1fr) 2fr;gap:10px;align-items:center;margin-block:8px}.bar-label{overflow-wrap:anywhere}.bar-track{height:28px;background:#e8edf2;border-radius:4px;overflow:hidden}.bar-fill{height:100%;min-width:2px;background:#176db0}.note{line-height:1.5}h1{font-size:1.6rem}@media(max-width:420px){form label{flex:1 1 100%}form button{width:100%}}`;
document.head.append(style);
const root = document.createElement('main');
root.id = 'analytics';
const heading = document.createElement('h1'); heading.textContent = 'Brugsstatistik'; root.append(heading);
const intro = document.createElement('p'); intro.className = 'note'; intro.textContent = 'Anonyme tællere for handlinger og resultater. Statistikken viser ikke unikke personer eller individuelle brugerforløb.'; root.append(intro);
const form = document.createElement('form'); root.append(form);
function field(labelText: string, input: HTMLElement) {
  const label = document.createElement('label');
  const caption = document.createElement('span'); caption.textContent = labelText;
  label.append(caption, input); form.append(label);
}
const from = document.createElement('input'); from.type = 'date'; from.required = true; from.name = 'from'; field('Fra og med (UTC)', from);
const to = document.createElement('input'); to.type = 'date'; to.required = true; to.name = 'to'; field('Til og med (UTC)', to);
const group = document.createElement('select'); group.name = 'group';
for (const [value, label] of [['date', 'Dag'], ['tool', 'Handling'], ['topic', 'Emne'], ['outcome', 'Udfald']]) {
  const option = document.createElement('option'); option.value = value; option.textContent = label!; group.append(option);
}
field('Gruppér efter', group);
const submit = document.createElement('button'); submit.type = 'submit'; submit.textContent = 'Vis statistik'; form.append(submit);
const status = document.createElement('p'); status.id = 'analytics-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); root.append(status);
const summary = document.createElement('p'); summary.id = 'analytics-summary'; root.append(summary);
const description = document.createElement('p'); description.className = 'note'; root.append(description);
const chart = document.createElement('section'); chart.id = 'analytics-chart'; chart.setAttribute('aria-hidden', 'true'); root.append(chart);
const chartNote = document.createElement('p'); chartNote.className = 'note'; root.append(chartNote);
const table = document.createElement('table'); table.id = 'analytics-table'; root.append(table);
document.body.append(root);
const today = new Date();
to.value = today.toISOString().slice(0, 10);
from.value = new Date(today.valueOf() - 29 * 86400000).toISOString().slice(0, 10);
let busy = false;
function message(text: string) { status.textContent = text; }
function clearResults() { summary.textContent = ''; description.textContent = ''; chart.replaceChildren(); table.replaceChildren(); chartNote.textContent = ''; }
function applyTheme() {
  const context = app.getHostContext();
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
}
function render(value: unknown) {
  if (!value || typeof value !== 'object') { clearResults(); message('Vælg en periode på højst 93 dage og hent statistik.'); return; }
  const result = value as Partial<Report> & { error?: { code?: string } };
  if (result.error) { clearResults(); message(result.error.code === 'FORBIDDEN' ? 'Administratoradgang kræves. Bed chatten om at kontrollere din adgang.' : 'Statistikken kunne ikke hentes. Kontrollér perioden og prøv igen.'); return; }
  if (!Array.isArray(result.items) || !['date', 'tool', 'topic', 'outcome'].includes(result.groupBy ?? '')) { clearResults(); message('Ingen statistik at vise. Hent en rapport gennem chatten.'); return; }
  const report = result as Report;
  from.value = report.from; to.value = report.to; group.value = report.groupBy;
  summary.textContent = `${new Intl.NumberFormat('da-DK').format(report.total)} ${report.unit === 'topic_interactions' ? 'visninger i viste emnegrupper' : 'værktøjskald'}`;
  description.textContent = report.description;
  chart.replaceChildren(); table.replaceChildren();
  const rows = report.items;
  message(rows.length ? '' : report.groupBy === 'topic' ? 'Ingen emnegrupper opfylder mindstegrænsen i perioden.' : 'Ingen registrerede handlinger i perioden.');
  const chartRows = report.groupBy === 'date' ? rows.slice(-12) : [...rows].sort((a, b) => b.count - a.count).slice(0, 12);
  const maximum = Math.max(1, ...chartRows.map(row => row.count));
  for (const row of chartRows) {
    const barRow = document.createElement('div'); barRow.className = 'bar-row';
    const label = document.createElement('span'); label.className = 'bar-label'; label.textContent = row.label;
    const track = document.createElement('div'); track.className = 'bar-track';
    const fill = document.createElement('div'); fill.className = 'bar-fill'; fill.style.width = `${row.count / maximum * 100}%`;
    track.append(fill); barRow.append(label, track); chart.append(barRow);
  }
  chartNote.textContent = rows.length > 12 ? 'Diagrammet viser højst 12 grupper. Tabellen viser alle rapportens grupper.' : '';
  const caption = document.createElement('caption'); caption.textContent = 'Handlinger i den valgte periode'; table.append(caption);
  const head = table.createTHead().insertRow();
  for (const label of (report.groupBy === 'topic' ? ['Emne', 'Visninger'] : ['Gruppe', 'Kald'])) { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; head.append(cell); }
  const body = table.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    const label = document.createElement('th'); label.scope = 'row'; label.textContent = row.label;
    const values = [row.count];
    for (const value of values) { const cell = tr.insertCell(); cell.textContent = new Intl.NumberFormat('da-DK').format(value); }
    tr.prepend(label);
  }
}
form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy || !form.reportValidity()) return;
  const first = Date.parse(`${from.value}T00:00:00Z`), last = Date.parse(`${to.value}T00:00:00Z`);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first || (last - first) / 86400000 >= 93) { message('Vælg fra- og tildato med højst 93 kalenderdage.'); return; }
  busy = true;
  for (const control of [from, to, group, submit]) control.disabled = true;
  message('Henter statistik …');
  try {
    const result = await app.callServerTool({ name: 'admin_usage_report', arguments: {
      from: new Date(first).toISOString(), to: new Date(last + 86400000 - 1).toISOString(), groupBy: group.value,
    } });
    render(result.structuredContent ?? { error: { code: 'INVALID_RESPONSE' } });
  } catch { clearResults(); message('Forbindelsen blev afbrudt. Prøv at hente statistikken igen.'); }
  finally { busy = false; for (const control of [from, to, group, submit]) control.disabled = false; }
});
app.ontoolresult = result => render(result.structuredContent);
app.addEventListener('hostcontextchanged', applyTheme);
message('Hent statistik gennem chatten eller vælg en periode.');
try { await app.connect(); applyTheme(); }
catch { clearResults(); message('Statistikvisningen kræver en MCP App-forbindelse. Bed chatten hente brugsstatistik.'); }
