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
  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Installér Høreforeningens app</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:1.5rem;font:1.1rem/1.5 "Trebuchet MS",Arial,sans-serif;background:#fff;color:#434445}main{text-align:center;max-width:30rem}a{display:inline-block;max-width:100%;padding:1rem 1.5rem;border:2px solid #434445;border-radius:.25rem;background:#BCCE41;color:#434445;font-weight:700;text-decoration:none;overflow-wrap:anywhere}a:hover{filter:brightness(.96)}a:focus-visible{outline:3px solid #434445;outline-offset:5px}p{margin:0;border-top:4px solid #BCCE41;padding-top:1rem}</style></head><body><main aria-label="Høreforeningens app">${destination ? `<a href="${escape(destination)}">Installér Høreforeningens app i ChatGPT</a>` : '<p role="status">Høreforeningens app er endnu ikke klar til installation i ChatGPT.</p>'}</main></body></html>`;
}
export function renderPublicPage(path: string, config: PublicPageConfig = {}): string | null {
  if (path === '/' || path === '/purpose') return installPage(config.chatGPTAppUrl);
  const publisher = config.publisherName?.trim();
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
    '/support': { title: 'Support og udgiver', body: `<p>${publisher ? `Udgiver: ${escape(publisher)}.` : 'Udgiveroplysninger er endnu ikke bekræftet til offentlig indsendelse.'}</p><p>${support ? `<a href="${escape(support)}" rel="noopener noreferrer">Kontakt support</a>.` : 'Supportkontakt er endnu ikke bekræftet.'}</p><p>Del ikke adgangsnøgler eller persondata i fejlbeskrivelser.</p>` },
  };
  if(config.hosted) {
    pages['/privacy'].title='Privatliv i udviklingsversionen';
    pages['/privacy'].body=pages['/privacy'].body.replace('Lokale sikkerhedskopier','Sikkerhedskopier').replace('Brug syntetiske data i denne udviklingsversion.','Hosting bruger Cloudflare Workers og D1 med Sites’ indbyggede identitet. Brug syntetiske data under afprøvningen.');
    pages['/terms'].body=pages['/terms'].body.replace('lokal udviklingsversion','udviklingsversion');
  }
  const page = pages[path];
  if (!page) return null;
  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)}</title><style>*{box-sizing:border-box}body{font:1rem/1.6 "Trebuchet MS",Arial,sans-serif;max-width:44rem;padding:1.5rem;margin:auto;color:#434445;background:#fff}nav{display:flex;flex-wrap:wrap;gap:1rem;border-bottom:4px solid #BCCE41;padding-bottom:1rem}a{color:inherit;text-decoration-thickness:2px;text-underline-offset:3px}a:hover{text-decoration-color:#BCCE41}a:focus-visible{outline:3px solid #434445;outline-offset:3px}h1{font-size:1.75rem;line-height:1.2}p{overflow-wrap:anywhere}</style></head><body><nav aria-label="Information"><a href="/">Installér appen</a><a href="/privacy">Privatliv</a><a href="/terms">Vilkår</a><a href="/support">Support</a></nav><main><h1>${escape(page.title)}</h1>${page.body}</main><footer><p>${config.hosted ? 'Udviklingsversion · under afprøvning' : 'Lokal udviklingsversion · ikke udgivet'}</p></footer></body></html>`;
}
