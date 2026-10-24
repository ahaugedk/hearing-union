import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { OpenAIExtensions } from '@openai/mcp-extensions/app';

type Receipt = { id: string; registrationStatus: 'registered'; contentAvailable: false };
type Lecture = { contentAvailable?: true; id: string; title: string; description: string; startsAt: string; endsAt: string; format: string; region: string; location: string; available: number; status: string; registrationStatus: string | null; canRegister: boolean };
const app = new App({ name: 'Høreforeningens foredrag', version: '0.1.0' });
new OpenAIExtensions(app);
const status = document.querySelector<HTMLElement>('#status')!;
const container = document.querySelector<HTMLElement>('#lectures')!;
let activeLecture: string | undefined;
let busy = false;
function message(text: string) { status.textContent = text; }
function applyTheme() {
  const context = app.getHostContext();
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
}
function paragraph(parent: HTMLElement, text: string) {
  const p = document.createElement('p'); p.textContent = text; parent.append(p);
}
function render(data: unknown) {
  if (!data || typeof data !== 'object') { message('Ingen foredrag at vise. Bed chatten finde foredrag.'); return; }
  const result = data as { items?: (Lecture | Receipt)[]; id?: string; error?: { code?: string } };
  if (result.error) { message(`Handlingen kunne ikke gennemføres (${result.error.code ?? 'fejl'}). Prøv igen gennem chatten.`); return; }
  const lectures = Array.isArray(result.items) ? result.items : result.id ? [data as Lecture | Receipt] : [];
  container.replaceChildren();
  message(lectures.length ? '' : 'Ingen foredrag matcher søgningen. Prøv en anden søgning gennem chatten.');
  for (const lecture of lectures) {
    const card = document.createElement('article');
    const heading = document.createElement('h2'); heading.textContent = lecture.contentAvailable === false ? 'Foredraget redigeres' : lecture.title; card.append(heading);
    if (lecture.contentAvailable === false) {
      paragraph(card, 'Dine tilmeldingsoplysninger er gemt. Foredragets aktuelle oplysninger er midlertidigt utilgængelige.');
    } else {
    const start = new Date(lecture.startsAt);
    paragraph(card, Number.isNaN(start.valueOf()) ? 'Dato er ikke tilgængelig' : new Intl.DateTimeFormat('da-DK', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Copenhagen' }).format(start));
    paragraph(card, `${lecture.format === 'online' ? 'Online' : 'Fysisk'} · ${lecture.location}`);
    paragraph(card, lecture.description);
    paragraph(card, lecture.status === 'cancelled' ? 'Aflyst' : lecture.available > 0 ? `${lecture.available} ledige pladser` : 'Udsolgt');
    }
    const registered = lecture.registrationStatus === 'registered';
    if (registered) paragraph(card, 'Du er tilmeldt.');
    const button = document.createElement('button'); button.type = 'button';
    button.textContent = registered ? 'Afmeld' : 'Tilmeld';
    button.setAttribute('aria-label', `${registered ? 'Afmeld' : 'Tilmeld'} ${lecture.contentAvailable === false ? 'foredraget, der redigeres' : lecture.title}`);
    button.disabled = busy || (!registered && (lecture.contentAvailable === false || !lecture.canRegister));
    button.addEventListener('click', async () => {
      if (busy) return;
      busy = true; activeLecture = lecture.id;
      const previousControls = [...container.querySelectorAll('button')].map(control => ({ control, disabled: control.disabled }));
      for (const { control } of previousControls) control.disabled = true;
      message('Gemmer …');
      let savedSuccessfully = false;
      try {
        const saved = await app.callServerTool({ name: registered ? 'lecture_unregister' : 'lecture_register', arguments: { lectureId: lecture.id } });
        if (saved.isError) { render(saved.structuredContent); return; }
        savedSuccessfully = true;
        const current = await app.callServerTool({ name: 'lecture_get', arguments: { id: activeLecture } });
        busy = false;
        if (current.isError) {
          // The mutation succeeded even when a newly hidden draft cannot be reread.
          container.replaceChildren();
          message(`${registered ? 'Du er afmeldt.' : 'Du er tilmeldt.'} Foredragets oplysninger er i øjeblikket utilgængelige.`);
        } else {
          render(current.structuredContent);
          message(registered ? 'Du er afmeldt.' : 'Du er tilmeldt.');
        }
      } catch {
        if (savedSuccessfully) {
          container.replaceChildren();
          message(`${registered ? 'Du er afmeldt.' : 'Du er tilmeldt.'} Foredraget kunne ikke genindlæses.`);
        } else {
          message('Forbindelsen blev afbrudt. Genåbn foredraget for at se, om ændringen blev gemt.');
        }
      }
      finally {
        busy = false;
        for (const { control, disabled } of previousControls) if (control.isConnected) control.disabled = disabled;
      }
    });
    card.append(button); container.append(card);
  }
}
app.ontoolresult = result => { busy = false; render(result.structuredContent); };
app.addEventListener('hostcontextchanged', applyTheme);
try { await app.connect(); applyTheme(); }
catch { message('Visningen kræver en MCP App-forbindelse. Brug chatten til at finde og tilmelde foredrag.'); }
