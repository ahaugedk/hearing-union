export type PublicPageConfig = { publisherName?: string; supportUrl?: string; chatGPTAppUrl?: string; hosted?: boolean };
const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
function installPage(address?: string): string {
  let destination: string | undefined;
  if (address?.trim()) {
    try {
      const url = new URL(address.trim());
      if (url.protocol === 'https:' && url.hostname === 'chatgpt.com' && !url.port && !url.username && !url.password && /^\/(?:apps|plugins)\/[^/]+(?:\/[^/]+)*\/?$/.test(url.pathname)) destination = url.href;
    } catch { /* Invalid configuration is an unavailable installation, never a guessed link. */ }
  }
  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Installér Høreforeningens app</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:1.5rem;font:1.1rem/1.5 system-ui;background:#f7faf9;color:#14352f}main{text-align:center;max-width:30rem}a{display:inline-block;max-width:100%;padding:1rem 1.5rem;border-radius:.75rem;background:#143f35;color:#fff;font-weight:650;text-decoration:none;overflow-wrap:anywhere}a:hover{background:#205b4c}a:focus-visible{outline:3px solid #0b7462;outline-offset:5px}p{margin:0}</style></head><body><main aria-label="Høreforeningens app">${destination ? `<a href="${escape(destination)}">Installér Høreforeningens app i ChatGPT</a>` : '<p role="status">Høreforeningens app er endnu ikke klar til installation i ChatGPT.</p>'}</main></body></html>`;
}
export function renderPublicPage(path: string, config: PublicPageConfig = {}): string | null {
  if (path === '/' || path === '/purpose') return installPage(config.chatGPTAppUrl);
  const publisher = config.publisherName?.trim() ?? 'Luffe Hansen';
  let support: string | undefined;
  const supportAddress = config.supportUrl ?? 'mailto:mail@hoereforeningen.dk';
  if (supportAddress) {
    if (/[\r\n]/.test(supportAddress)) throw new Error('Invalid support address');
    const url = new URL(supportAddress);
    const safeEmail = url.protocol === 'mailto:' && !url.pathname.includes('%') && /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(url.pathname) && !url.search && !url.hash;
    if ((!safeEmail && url.protocol !== 'https:') || url.username || url.password) throw new Error('Support address must be HTTPS or a single mailto recipient');
    support = url.href;
  }
  const pages: Record<string, { title: string; body: string }> = {
    '/privacy': { title: 'Privatliv i den lokale udviklingsversion', body: '<p>Databasen gemmer en serverafledt kontoidentitet, rolle, udtrykkeligt valgte emner og områder samt tilmeldinger. Eventabonnementer kan gemme filtre, callback, krypteret signeringsnøgle, udløb og leveringsstatus.</p><p>Kontodata, præferencer og tilmeldinger opbevares, indtil kontoen slettes. Sletning fjerner kontoens personlige data og abonnementer; nødvendige indholdsrevisioner og administratorhandlinger bevares uden reference til den slettede konto. Ejerkontoen kan ikke slettes med det almindelige kontoværktøj.</p><p>Indholdsrevisioner og aggregerede tællere har ingen automatisk slettefrist i udviklingsversionen. Tællerne indeholder ikke samtaletekst, søgetekst, IP-adresser eller bruger-id. Hashbaseret ratebegrænsning udløber efter ét minut; udløbne rækker ryddes ved næste autentificerede kald.</p><p>Lokale sikkerhedskopier kan indeholde kontodata. Miljøejeren skal beskytte og slette dem særskilt; kontosletning fjerner ikke tidligere sikkerhedskopier. Brug syntetiske data i denne udviklingsversion. Frister og produktionsvilkår skal fastlægges før udgivelse.</p>' },
    '/terms': { title: 'Vilkår og begrænsninger', body: '<p>Dette er en lokal udviklingsversion til afprøvning med syntetiske data. Den er ikke en færdig offentlig tjeneste eller et tilbud om sundhedsfaglig behandling. Kontrollér kilder og aktuelle oplysninger.</p><p>Endelige brugsvilkår, udgiveroplysninger og driftsforpligtelser er ikke fastlagt her. Siden udgør ikke en påstand om godkendte juridiske vilkår.</p>' },
    '/support': { title: 'Support og udgiver', body: `<p>${publisher ? `Konfigureret udgiver: ${escape(publisher)}.` : 'Udgivernavn mangler. Miljøejeren skal angive PUBLISHER_NAME før udgivelse.'}</p><p>${support ? `<a href="${escape(support)}" rel="noopener noreferrer">Kontakt support</a>.` : 'Supportkontakt mangler. Miljøejeren skal angive en HTTPS-adresse i SUPPORT_URL før udgivelse.'}</p><address>Høreforeningen<br>Blekinge Boulevard 2<br>2630 Taastrup</address><p>Del ikke kontotokens, signeringsnøgler eller persondata i fejlbeskrivelser.</p>` },
    '/connection': { title: 'Forbindelse og adgang', body: '<p>Den lokale MCP-server lytter kun på 127.0.0.1 og bruger særskilte udviklingskonti med lokale tokens. Den er ikke et offentligt endpoint og implementerer ikke Sites-login.</p><p>Sites-identitet, faktisk ChatGPT-forbindelse, eventmodtagelse og offentlig revieweradgang skal afprøves særskilt før deployment. Kopiér aldrig lokale udviklingstokens til et Site.</p>' },
  };
  if(config.hosted) {
    pages['/connection'].body='<p>Sites autentificerer brugeren og leverer det stabile bruger-id til /mcp. Appen har ingen egne login-, callback- eller sessionroutes. Roller og adgang til egne data kontrolleres i databasen ved hvert kald.</p><p>Eventbeskeder kræver et særskilt, udtrykkeligt tilvalg. Faktisk ChatGPT-forbindelse og modtagelse af eventbeskeder skal godkendes gennem den normale platformafprøvning før offentlig udgivelse.</p>';
    pages['/privacy'].title='Privatliv i udviklingsversionen';
    pages['/privacy'].body=pages['/privacy'].body.replace('Lokale sikkerhedskopier','Sikkerhedskopier').replace('Brug syntetiske data i denne udviklingsversion.','Hosting bruger Cloudflare Workers og D1 med Sites’ indbyggede identitet. Brug syntetiske data under afprøvningen.');
    pages['/terms'].body=pages['/terms'].body.replace('lokal udviklingsversion','udviklingsversion');
  }
  const page = pages[path];
  if (!page) return null;
  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)}</title><style>body{font:1rem/1.6 system-ui;max-width:48rem;padding:1.5rem;margin:auto;color:#172b35;background:#fff}nav{display:flex;flex-wrap:wrap;gap:1rem}a{color:#075c96}a:focus-visible{outline:3px solid #075c96;outline-offset:3px}</style></head><body><nav aria-label="Information"><a href="/">Formål</a><a href="/privacy">Privatliv</a><a href="/terms">Vilkår</a><a href="/support">Support</a><a href="/connection">Forbindelse</a></nav><main><h1>${escape(page.title)}</h1>${page.body}</main><footer><p>${config.hosted ? 'Udviklingsversion · under afprøvning' : 'Lokal udviklingsversion · ikke udgivet'}</p></footer></body></html>`;
}
