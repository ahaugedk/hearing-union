import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseSync, SQLInputValue } from 'node:sqlite';
import { recordUsage, usageReport, type TopicAction, type UsageGroup } from './analytics.js';

type Row = Record<string, any>;
export type Actor = { subject: string };
export class DomainError extends Error {
  public code: string;
  constructor(code: string, message: string) { super(message); this.code = code; this.name = 'DomainError'; }
}
function fail(code: string, message: string): never { throw new DomainError(code, message); }
const iso = (value: number | null) => value === null ? null : new Date(value).toISOString();
const text = (value: unknown, name: string, max = 1000): string => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) return fail('INVALID_INPUT', `${name} skal være tekst på 1–${max} tegn.`);
  return value.trim();
};
const integer = (value: unknown, name: string, min = 0, max = Number.MAX_SAFE_INTEGER): number => {
  if (!Number.isSafeInteger(value) || (value as number) < min || (value as number) > max) return fail('INVALID_INPUT', `${name} er ugyldigt.`);
  return value as number;
};
const strings = (value: unknown, name: string, max = 50): string[] => {
  if (!Array.isArray(value) || value.length > max) return fail('INVALID_INPUT', `${name} skal være en begrænset liste.`);
  return [...new Set(value.map(v => text(v, name, 200)))];
};
function fields(value: unknown, allowed: string[]): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('INVALID_INPUT', 'Argumenter skal være et objekt.');
  const a = value as Row;
  if (Object.keys(a).some(k => !allowed.includes(k))) return fail('INVALID_INPUT', 'Ukendte felter i kaldet.');
  return a;
}
function timestamp(value: unknown, name: string): number {
  if (typeof value === 'number') return integer(value, name, 0, 8.64e15);
  if (typeof value !== 'string' || !/T.*(?:Z|[+-]\d\d:\d\d)$/.test(value)) return fail('INVALID_INPUT', `${name} skal indeholde tidszone.`);
  const n = Date.parse(value); if (!Number.isSafeInteger(n) || n < 0 || n > 8.64e15) return fail('INVALID_INPUT', `${name} er ugyldigt.`); return n;
}
const validFormat = (value: unknown, any = false): string => {
  if (!['physical', 'online', ...(any ? ['any'] : [])].includes(value as string)) return fail('INVALID_INPUT', 'Ugyldigt format.');
  return value as string;
};
const visibility = `WITH RECURSIVE visible(id) AS (
 SELECT id FROM knowledge_nodes WHERE parent_id IS NULL AND status='published' AND (expires_at IS NULL OR expires_at>?)
 UNION ALL SELECT n.id FROM knowledge_nodes n JOIN visible v ON n.parent_id=v.id
 WHERE n.status='published' AND (n.expires_at IS NULL OR n.expires_at>?)
)`;

/** Shared application functions; caller must obtain subject from a trusted authentication boundary. */
export class HearingUnion {
  private db: DatabaseSync;
  private config: { ownerSubject: string };
  constructor(db: DatabaseSync, config: { ownerSubject: string }) {
    this.db = db; this.config = config;
    if (!config.ownerSubject.trim()) throw new Error('ownerSubject must be configured explicitly.');
  }
  private get(sql: string, ...params: SQLInputValue[]): Row | undefined { return this.db.prepare(sql).get(...params) as Row | undefined; }
  private all(sql: string, ...params: SQLInputValue[]): Row[] { return this.db.prepare(sql).all(...params) as Row[]; }
  private run(sql: string, ...params: SQLInputValue[]) { return this.db.prepare(sql).run(...params); }
  private atomic<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); this.db.exec('COMMIT'); return result; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  private resolve(actor: Actor, now: number): Row {
    const subject = text(actor?.subject, 'identitet', 500);
    let user = this.get('SELECT * FROM users WHERE auth_subject=?', subject);
    if (!user) {
      const id = randomUUID();
      this.run('INSERT INTO users(id,auth_subject,role,created_at) VALUES(?,?,?,?)', id, subject, subject === this.config.ownerSubject ? 'owner' : 'user', now);
      this.run('INSERT INTO user_preferences(user_id) VALUES(?)', id);
      user = this.get('SELECT * FROM users WHERE id=?', id)!;
    }
    return user;
  }
  private admin(user: Row) { if (user.role !== 'admin' && user.role !== 'owner') fail('FORBIDDEN', 'Administratoradgang kræves.'); }
  private owner(user: Row) { if (user.role !== 'owner') fail('FORBIDDEN', 'Kun ejeren kan ændre roller.'); }
  private audit(user: Row, action: string, target: string, version: number | null, now: number) {
    this.run('INSERT INTO admin_audit(actor_id,action,target_id,version,created_at) VALUES(?,?,?,?,?)', user.id, action, target, version, now);
  }
  private page(a: Row) { return { limit: a.limit === undefined ? 20 : integer(a.limit, 'limit', 1, 100), offset: a.offset === undefined ? 0 : integer(a.offset, 'offset', 0, 10000) }; }
  private version(row: Row, expected: unknown) { if (row.version !== integer(expected, 'expectedVersion', 1)) fail('VERSION_CONFLICT', 'Indholdet er ændret. Hent det igen.'); }
  private profile(user: Row) {
    const prefs = this.get('SELECT * FROM user_preferences WHERE user_id=?', user.id)!;
    return { id: user.id, role: user.role, preferencesNotice: 'Vi gemmer kun de emneinteresser, geografiske områder og formater, du selv vælger, for at finde relevante foredrag. Interesser kan være følsomme. Oplysningerne gemmes, indtil du ændrer dem eller sletter kontoen. Gennemgå valgene og giv udtrykkeligt samtykke, før de gemmes. Præferencer opretter ikke automatisk et eventabonnement.', preferences: { format: prefs.format, version: prefs.version,
      topics: this.all('SELECT topic_id FROM user_topic_preferences WHERE user_id=? ORDER BY topic_id', user.id).map(r => r.topic_id),
      regions: this.all('SELECT region FROM user_region_preferences WHERE user_id=? ORDER BY region', user.id).map(r => r.region) } };
  }
  private node(row: Row, now: number, sources?: Row[], relatedIds?: string[]) {
    return { id: row.id, slug: row.slug, parentId: row.parent_id, title: row.title, summary: row.summary,
      keywords: JSON.parse(row.keywords_json), status: row.status, version: row.version,
      relatedIds: relatedIds ?? this.all(visibility + ' SELECT e.related_id FROM knowledge_edges e JOIN visible v ON e.related_id=v.id WHERE e.node_id=? ORDER BY e.related_id', now, now, row.id).map(r => r.related_id),
      expiresAt: iso(row.expires_at), verifiedAt: iso(row.verified_at), retrievedAt: iso(now),
      sources: (sources ?? this.all('SELECT url,title,verified_at FROM knowledge_sources WHERE node_id=? ORDER BY url', row.id)).map(r => ({ url: r.url, title: r.title, verifiedAt: iso(r.verified_at) })),
      instructions: 'Henvis til kilderne. Hent aktuel viden ved nye faktuelle spørgsmål. Gem ikke denne viden i ChatGPT-hukommelsen.' };
  }
  private lecture(row: Row, user: Row, now: number, data?: { registered: number; status: string | null; topics: string[] }) {
    const registered = data?.registered ?? this.get("SELECT COUNT(*) n FROM registrations WHERE lecture_id=? AND status='registered'", row.id)!.n;
    return { id: row.id, title: row.title, description: row.description, startsAt: iso(row.starts_at), endsAt: iso(row.ends_at),
      format: row.format, region: row.region, location: row.location, capacity: row.capacity, available: Math.max(0, row.capacity - registered),
      status: row.status, version: row.version,
      registrationStatus: data ? data.status : this.get('SELECT status FROM registrations WHERE user_id=? AND lecture_id=?', user.id, row.id)?.status ?? null,
      canRegister: row.status === 'published' && row.starts_at > now && registered < row.capacity,
      topics: data ? data.topics : this.all('SELECT topic_id FROM lecture_topics WHERE lecture_id=? ORDER BY topic_id', row.id).map(r => r.topic_id) };
  }
  private nodes(rows: Row[], now: number, rawRelations = false) {
    if (!rows.length) return [];
    const placeholders=rows.map(()=>'?').join(',');
    const sources=this.all(`SELECT node_id,url,title,verified_at FROM knowledge_sources WHERE node_id IN (${placeholders}) ORDER BY node_id,url`,...rows.map(r=>r.id));
    const byId=new Map<string,Row[]>(); for(const source of sources){const list=byId.get(source.node_id)??[];list.push(source);byId.set(source.node_id,list);}
    const edges=rawRelations
      ? this.all(`SELECT node_id,related_id FROM knowledge_edges WHERE node_id IN (${placeholders}) ORDER BY related_id`,...rows.map(r=>r.id))
      : this.all(visibility + ` SELECT e.node_id,e.related_id FROM knowledge_edges e JOIN visible v ON e.related_id=v.id WHERE e.node_id IN (${placeholders}) ORDER BY e.related_id`,now,now,...rows.map(r=>r.id));
    const related=new Map<string,string[]>();for(const edge of edges){const list=related.get(edge.node_id)??[];list.push(edge.related_id);related.set(edge.node_id,list);}
    return rows.map(row=>this.node(row,now,byId.get(row.id)??[],related.get(row.id)??[]));
  }
  private lectures(rows: Row[],user: Row,now: number) {
    if (!rows.length) return [];
    const placeholders=rows.map(()=>'?').join(','),ids=rows.map(r=>r.id);
    const counts=new Map(this.all(`SELECT lecture_id,COUNT(*) n FROM registrations WHERE status='registered' AND lecture_id IN (${placeholders}) GROUP BY lecture_id`,...ids).map(r=>[r.lecture_id,r.n]));
    const own=new Map(this.all(`SELECT lecture_id,status FROM registrations WHERE user_id=? AND lecture_id IN (${placeholders})`,user.id,...ids).map(r=>[r.lecture_id,r.status]));
    const topics=new Map<string,string[]>();for(const t of this.all(`SELECT lecture_id,topic_id FROM lecture_topics WHERE lecture_id IN (${placeholders}) ORDER BY topic_id`,...ids)){const list=topics.get(t.lecture_id)??[];list.push(t.topic_id);topics.set(t.lecture_id,list);}
    return rows.map(row=>this.lecture(row,user,now,{registered:counts.get(row.id)??0,status:own.get(row.id)??null,topics:topics.get(row.id)??[]}));
  }
  /** Trusted transport identity lookup; discovery/authorization does not count as a user action. */
  resolveActor(actor: Actor, now = Date.now()): { id: string; role: 'user' | 'admin' | 'owner' } {
    integer(now, 'now', 0, 8.64e15);
    return this.atomic(() => { const user = this.resolve(actor, now); return { id: user.id, role: user.role }; });
  }
  execute(tool: string, input: unknown, actor: Actor, now = Date.now()): unknown {
    integer(now, 'now', 0, 8.64e15);
    try {
      return this.atomic(() => {
        const user = this.resolve(actor, now);
        const result = this.dispatch(tool, input, user, now);
        if (tool !== 'admin_usage_report') {
          let topics: { action: TopicAction; ids: string[] } | undefined;
          const data = result as { id?: string; items?: { id: string }[] };
          if (tool === 'knowledge_get' && data.id) topics = { action: 'direct_lookup', ids: [data.id] };
          if (tool === 'knowledge_search' || tool === 'knowledge_children') topics = {
            action: tool === 'knowledge_search' ? 'search_result' : 'tree_result', ids: (data.items ?? []).map(item => item.id),
          };
          recordUsage(this.db, tool, 'success', now, topics);
        }
        return result;
      });
    } catch (error) {
      // The failed transaction has already rolled back. Persist only a bounded anonymous outcome.
      const outcome = error instanceof DomainError ? error.code : 'INTERNAL_ERROR';
      this.atomic(() => recordUsage(this.db, tool, outcome, now));
      throw error;
    }
  }
  private dispatch(tool: string, input: unknown, user: Row, now: number): unknown {
    if (tool.startsWith('admin_')) this.admin(user);
    if (tool.startsWith('owner_')) this.owner(user);
    switch (tool) {
      case 'get_profile': fields(input, []); return this.profile(user);
      case 'update_preferences': {
        const a = fields(input, ['format','topics','regions','expectedVersion','consent']);
        const old = this.get('SELECT * FROM user_preferences WHERE user_id=?', user.id)!; this.version(old, a.expectedVersion);
        if (a.consent !== true) fail('INVALID_INPUT', 'Gennemgå de valgte emneinteresser, områder og formater samt opbevaringen. Indhent brugerens udtrykkelige samtykke, og send consent: true for at gemme.');
        const format = validFormat(a.format, true), topics = strings(a.topics, 'topics'), regions = strings(a.regions, 'regions');
        for (const id of topics) if (!this.get(visibility + ' SELECT id FROM visible WHERE id=?', now, now, id)) fail('NOT_FOUND', 'Emnet findes ikke.');
        this.run('UPDATE user_preferences SET format=?,version=version+1 WHERE user_id=?', format, user.id);
        this.run('DELETE FROM user_topic_preferences WHERE user_id=?', user.id);
        this.run('DELETE FROM user_region_preferences WHERE user_id=?', user.id);
        for (const id of topics) this.run('INSERT INTO user_topic_preferences VALUES(?,?)', user.id, id);
        for (const region of regions) this.run('INSERT INTO user_region_preferences VALUES(?,?)', user.id, region);
        return this.profile(user);
      }
      case 'delete_account': {
        const a = fields(input, ['confirm']); if (a.confirm !== true) fail('INVALID_INPUT', 'Bekræft kontosletning.');
        if (user.role === 'owner') fail('FORBIDDEN', 'Ejerkontoen kan ikke slettes gennem dette værktøj.');
        // Role-audit targets are account references too; the actor FK alone is insufficient.
        this.run("UPDATE admin_audit SET target_id='deleted-account' WHERE action='owner_set_admin' AND target_id=?", user.id);
        this.run('DELETE FROM request_rate_limits WHERE subject_hash=?', createHash('sha256').update(user.auth_subject).digest('hex'));
        // Foreign-key cascades remove personal data, event secrets, deliveries and verification caches.
        this.run('DELETE FROM users WHERE id=?', user.id); return { deleted: true };
      }
      case 'owner_list_admins': {
        fields(input, []); return { items: this.all("SELECT id,role FROM users WHERE role IN ('admin','owner') ORDER BY id") };
      }
      case 'owner_set_admin': {
        const a = fields(input, ['userId','enabled']); const id = text(a.userId, 'userId', 200);
        if (typeof a.enabled !== 'boolean') fail('INVALID_INPUT', 'enabled skal være sand eller falsk.');
        const target = this.get('SELECT * FROM users WHERE id=?', id); if (!target) fail('NOT_FOUND', 'Kontoen findes ikke.');
        if (target.role === 'owner') fail('FORBIDDEN', 'Ejerrollen kan ikke ændres.');
        this.run('UPDATE users SET role=? WHERE id=?', a.enabled ? 'admin' : 'user', id); this.audit(user, tool, id, null, now);
        return { id, role: a.enabled ? 'admin' : 'user' };
      }
      case 'knowledge_get': {
        const a = fields(input, ['id']); const id = text(a.id, 'id', 200);
        const row = this.get(visibility + ' SELECT n.* FROM knowledge_nodes n JOIN visible v ON n.id=v.id WHERE n.id=?', now, now, id);
        if (!row) fail('NOT_FOUND', 'Emnet er ikke tilgængeligt eller kræver opdatering.'); return this.node(row, now);
      }
      case 'knowledge_search': case 'knowledge_children': case 'admin_knowledge_list': {
        const a = fields(input, tool === 'knowledge_search' ? ['query','limit','offset'] : tool === 'knowledge_children' ? ['parentId','limit','offset'] : ['limit','offset']);
        const { limit, offset } = this.page(a); let rows: Row[];
        if (tool === 'admin_knowledge_list') rows = this.all('SELECT * FROM knowledge_nodes ORDER BY title,id LIMIT ? OFFSET ?', limit, offset);
        else if (tool === 'knowledge_children') {
          const parent = a.parentId === undefined || a.parentId === null ? null : text(a.parentId, 'parentId', 200);
          rows = this.all(visibility + ' SELECT n.* FROM knowledge_nodes n JOIN visible v ON n.id=v.id WHERE n.parent_id IS ? ORDER BY n.title,n.id LIMIT ? OFFSET ?', now, now, parent, limit, offset);
        } else {
          const query = text(a.query, 'query', 300); const tokens = query.match(/[\p{L}\p{N}]+/gu) ?? [];
          if (!tokens.length) return { items: [], limit, offset };
          const expression = tokens.map(t => '"' + t + '"*').join(' AND ');
          rows = this.all(visibility + ' SELECT n.* FROM knowledge_fts JOIN knowledge_nodes n ON n.id=knowledge_fts.id JOIN visible v ON v.id=n.id WHERE knowledge_fts MATCH ? ORDER BY bm25(knowledge_fts,0,10,1,5),n.id LIMIT ? OFFSET ?', now, now, expression, limit, offset);
        }
        return { items: this.nodes(rows, now, tool === 'admin_knowledge_list'), limit, offset };
      }
      case 'admin_knowledge_save': return this.saveKnowledge(input, user, now);
      case 'admin_knowledge_publish': {
        const a = fields(input, ['id','expectedVersion']); const row = this.get('SELECT * FROM knowledge_nodes WHERE id=?', text(a.id, 'id', 200));
        if (!row) fail('NOT_FOUND', 'Emnet findes ikke.'); this.version(row, a.expectedVersion);
        if (row.expires_at !== null && row.expires_at <= now) fail('EXPIRED', 'Udløbet indhold kan ikke publiceres.');
        if (!this.get('SELECT 1 FROM knowledge_sources WHERE node_id=?', row.id)) fail('INVALID_INPUT', 'Mindst én kilde kræves.');
        this.run("UPDATE knowledge_nodes SET status='published',version=version+1 WHERE id=?", row.id);
        this.reviseKnowledge(row.id, user, now); return this.rawNode(this.get('SELECT * FROM knowledge_nodes WHERE id=?', row.id)!, now);
      }
      case 'lecture_get': {
        const a = fields(input, ['id']); const row = this.get("SELECT * FROM lectures WHERE id=? AND status IN ('published','cancelled')", text(a.id, 'id', 200));
        if (!row) fail('NOT_FOUND', 'Foredraget findes ikke.'); return this.lecture(row, user, now);
      }
      case 'lecture_search': {
        const a = fields(input, ['query','topicId','region','format','from','to','limit','offset']); const { limit, offset } = this.page(a);
        const where = ["l.status='published'", 'l.starts_at>?']; const params: SQLInputValue[] = [now];
        if (a.query !== undefined) { const q = '%' + text(a.query,'query',300).replace(/[!%_]/g, '!$&') + '%'; where.push("(l.title LIKE ? ESCAPE '!' OR l.description LIKE ? ESCAPE '!')"); params.push(q,q); }
        if (a.topicId !== undefined) { where.push('EXISTS(SELECT 1 FROM lecture_topics t WHERE t.lecture_id=l.id AND t.topic_id=?)'); params.push(text(a.topicId,'topicId',200)); }
        if (a.region !== undefined) { where.push("(l.format='online' OR l.region=?)"); params.push(text(a.region,'region',200)); }
        if (a.format !== undefined && a.format !== 'any') { where.push('l.format=?'); params.push(validFormat(a.format)); }
        if (a.from !== undefined) { where.push('l.starts_at>=?'); params.push(timestamp(a.from,'from')); }
        if (a.to !== undefined) { where.push('l.starts_at<=?'); params.push(timestamp(a.to,'to')); }
        const rows = this.all('SELECT l.* FROM lectures l WHERE ' + where.join(' AND ') + ' ORDER BY l.starts_at,l.id LIMIT ? OFFSET ?', ...params, limit, offset);
        return { items: this.lectures(rows,user,now), limit, offset };
      }
      case 'my_registrations': {
        const a = fields(input, ['limit','offset']); const { limit, offset } = this.page(a);
        const rows=this.all("SELECT l.* FROM lectures l JOIN registrations r ON r.lecture_id=l.id WHERE r.user_id=? AND r.status='registered' ORDER BY l.starts_at,l.id LIMIT ? OFFSET ?", user.id, limit, offset);
        const publicResults=new Map(this.lectures(rows.filter(r=>r.status!=='draft'),user,now).map(r=>[r.id,r]));
        return { items: rows.map(r=>publicResults.get(r.id)??{id:r.id,registrationStatus:'registered',contentAvailable:false}), limit, offset };
      }
      case 'lecture_register': case 'lecture_unregister': {
        const a = fields(input, ['lectureId']); const id = text(a.lectureId, 'lectureId', 200);
        const row = this.get('SELECT * FROM lectures WHERE id=?', id); if (!row) fail('NOT_FOUND', 'Foredraget findes ikke.');
        if (tool === 'lecture_unregister') {
          if(row.status==='draft'&&!this.get('SELECT 1 FROM registrations WHERE user_id=? AND lecture_id=?',user.id,id))fail('NOT_FOUND','Foredraget findes ikke.');
          this.run("UPDATE registrations SET status='cancelled' WHERE user_id=? AND lecture_id=?", user.id, id);
          return row.status==='draft'?{lectureId:id,registrationStatus:'cancelled'}:this.lecture(row,user,now);
        }
        if (row.status !== 'published' || row.starts_at <= now) fail('NOT_AVAILABLE', 'Foredraget kan ikke tilmeldes.');
        if (this.get("SELECT 1 FROM registrations WHERE user_id=? AND lecture_id=? AND status='registered'", user.id,id)) return this.lecture(row,user,now);
        const result = this.run(`INSERT INTO registrations(user_id,lecture_id,status,created_at)
          SELECT ?,id,'registered',? FROM lectures WHERE id=? AND status='published' AND starts_at>?
          AND (SELECT COUNT(*) FROM registrations WHERE lecture_id=lectures.id AND status='registered')<capacity
          ON CONFLICT(user_id,lecture_id) DO UPDATE SET status='registered',created_at=excluded.created_at`, user.id, now, id, now);
        if (!result.changes) fail('FULL', 'Foredraget er fuldt booket.'); return this.lecture(row,user,now);
      }
      case 'admin_lecture_list': {
        const a=fields(input,['query','status','limit','offset']);const {limit,offset}=this.page(a);
        const where:string[]=[],params:SQLInputValue[]=[];
        if(a.status!==undefined){if(!['draft','published','cancelled'].includes(a.status))fail('INVALID_INPUT','Ugyldig foredragsstatus.');where.push('l.status=?');params.push(a.status);}
        if(a.query!==undefined){const query='%'+text(a.query,'query',300).replace(/[!%_]/g,'!$&')+'%';where.push("(l.title LIKE ? ESCAPE '!' OR l.description LIKE ? ESCAPE '!')");params.push(query,query);}
        const rows=this.all('SELECT l.* FROM lectures l'+(where.length?' WHERE '+where.join(' AND '):'')+' ORDER BY l.starts_at,l.id LIMIT ? OFFSET ?',...params,limit,offset);
        return{items:this.lectures(rows,user,now),limit,offset};
      }
      case 'admin_lecture_save': return this.saveLecture(input,user,now);
      case 'admin_lecture_publish': case 'admin_lecture_cancel': {
        const a = fields(input, ['id','expectedVersion']); const row = this.get('SELECT * FROM lectures WHERE id=?', text(a.id,'id',200));
        if (!row) fail('NOT_FOUND', 'Foredraget findes ikke.'); this.version(row,a.expectedVersion);
        if (tool === 'admin_lecture_publish' && row.starts_at <= now) fail('INVALID_INPUT', 'Kun fremtidige foredrag kan publiceres.');
        const status = tool === 'admin_lecture_publish' ? 'published' : 'cancelled';
        this.run('UPDATE lectures SET status=?,version=version+1 WHERE id=?', status,row.id);
        if (status === 'published') this.run("INSERT INTO outbox_events(id,event_name,lecture_id,lecture_version,created_at) VALUES(?,'lecture.relevant_published',?,?,?)", randomUUID(),row.id,row.version+1,now);
        this.audit(user,tool,row.id,row.version+1,now); return this.lecture(this.get('SELECT * FROM lectures WHERE id=?',row.id)!,user,now);
      }
      case 'admin_lecture_registrations': {
        const a = fields(input, ['lectureId','limit','offset']); const {limit,offset}=this.page(a); const id=text(a.lectureId,'lectureId',200);
        if (!this.get('SELECT 1 FROM lectures WHERE id=?',id)) fail('NOT_FOUND','Foredraget findes ikke.');
        return {items:this.all("SELECT user_id userId,created_at FROM registrations WHERE lecture_id=? AND status='registered' ORDER BY created_at,user_id LIMIT ? OFFSET ?",id,limit,offset).map(r=>({userId:r.userId,registeredAt:iso(r.created_at)})),limit,offset};
      }
      case 'admin_audit_log': {
        const a=fields(input,['limit','offset']); const {limit,offset}=this.page(a);return {items:this.all('SELECT id,action,target_id targetId,version,created_at FROM admin_audit ORDER BY id DESC LIMIT ? OFFSET ?',limit,offset).map(r=>({...r,createdAt:iso(r.created_at),created_at:undefined})),limit,offset};
      }
      case 'admin_usage_report': {
        const a=fields(input,['from','to','groupBy']);const from=timestamp(a.from,'from'),to=timestamp(a.to,'to');
        if(to<from||Math.floor(to/86400000)-Math.floor(from/86400000)>=93) fail('INVALID_INPUT','Vælg højst 93 kalenderdage.');
        if(a.groupBy!==undefined&&!['date','tool','topic','outcome'].includes(a.groupBy)) fail('INVALID_INPUT','Ugyldig gruppering.');
        return usageReport(this.db,from,to,(a.groupBy??'date') as UsageGroup);
      }
      default: return fail('UNKNOWN_TOOL','Ukendt værktøj.');
    }
  }
  private rawNode(row: Row,now: number) {
    return this.node(row,now,undefined,this.all('SELECT related_id FROM knowledge_edges WHERE node_id=? ORDER BY related_id',row.id).map(r=>r.related_id));
  }
  private reviseKnowledge(id: string,user: Row,now: number) {
    const row=this.get('SELECT * FROM knowledge_nodes WHERE id=?',id)!;
    this.run('INSERT INTO knowledge_revisions(node_id,actor_id,version,snapshot_json,created_at) VALUES(?,?,?,?,?)',id,user.id,row.version,JSON.stringify(this.rawNode(row,now)),now);
    this.audit(user,'knowledge_change',id,row.version,now);
  }
  private saveKnowledge(input: unknown,user: Row,now: number) {
    const a=fields(input,['id','expectedVersion','slug','parentId','title','summary','keywords','expiresAt','verifiedAt','sources','relatedIds','status']);
    const id=a.id===undefined?randomUUID():text(a.id,'id',200), old=this.get('SELECT * FROM knowledge_nodes WHERE id=?',id);
    if(old)this.version(old,a.expectedVersion);else if(a.expectedVersion!==undefined)fail('VERSION_CONFLICT','Emnet findes ikke.');
    const slug=text(a.slug,'slug',150);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail('INVALID_INPUT','slug skal bruge små ASCII-bogstaver, tal og bindestreger.');
    const title=text(a.title,'title',200),summary=text(a.summary,'summary',5000),keywords=strings(a.keywords,'keywords');
    const parent=a.parentId===undefined||a.parentId===null?null:text(a.parentId,'parentId',200);
    if(parent){
      if(!this.get('SELECT 1 FROM knowledge_nodes WHERE id=?',parent))fail('NOT_FOUND','Forældreemnet findes ikke.');
      if(parent===id||this.get('WITH RECURSIVE ancestors(id,parent_id) AS (SELECT id,parent_id FROM knowledge_nodes WHERE id=? UNION ALL SELECT n.id,n.parent_id FROM knowledge_nodes n JOIN ancestors a ON n.id=a.parent_id) SELECT 1 FROM ancestors WHERE id=?',parent,id))fail('INVALID_INPUT','Emnetræet må ikke indeholde cykler.');
    }
    const expires=a.expiresAt===undefined||a.expiresAt===null?null:timestamp(a.expiresAt,'expiresAt');
    const verified=a.verifiedAt===undefined?now:timestamp(a.verifiedAt,'verifiedAt');if(verified>now)fail('INVALID_INPUT','Kildens kontroldato kan ikke være i fremtiden.');
    if(!Array.isArray(a.sources)||a.sources.length<1||a.sources.length>20)fail('INVALID_INPUT','Angiv 1–20 kilder.');
    const sources=a.sources.map((v:unknown)=>{
      const s=fields(v,['url','title']);const url=text(s.url,'url',2000);let parsed:URL;
      try{parsed=new URL(url);}catch{return fail('INVALID_INPUT','Ugyldig kilde-URL.');}
      if(parsed.protocol!=='https:'||parsed.username||parsed.password)fail('INVALID_INPUT','Kilder skal bruge HTTPS uden credentials.');
      return{url,title:text(s.title,'kildetitel',300)};
    });
    if(new Set(sources.map((s:Row)=>s.url)).size!==sources.length)fail('INVALID_INPUT','Dublerede kilder.');
    const related=a.relatedIds===undefined?[]:strings(a.relatedIds,'relatedIds');
    for(const other of related)if(other===id||!this.get('SELECT 1 FROM knowledge_nodes WHERE id=?',other))fail('INVALID_INPUT','Ugyldig emnerelation.');
    const status=a.status==='archived'?'archived':'draft';if(a.status!==undefined&&!['draft','archived'].includes(a.status))fail('INVALID_INPUT','Gem som kladde eller arkiveret; publicér særskilt.');
    if(this.get('SELECT id FROM knowledge_nodes WHERE slug=? AND id<>?',slug,id))fail('CONFLICT','Slug er allerede i brug.');
    this.run(`INSERT INTO knowledge_nodes(id,slug,parent_id,title,summary,keywords_json,status,expires_at,verified_at,version) VALUES(?,?,?,?,?,?,?,?,?,1)
      ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,parent_id=excluded.parent_id,title=excluded.title,summary=excluded.summary,keywords_json=excluded.keywords_json,status=excluded.status,expires_at=excluded.expires_at,verified_at=excluded.verified_at,version=knowledge_nodes.version+1`,id,slug,parent,title,summary,JSON.stringify(keywords),status,expires,verified);
    this.run('DELETE FROM knowledge_sources WHERE node_id=?',id);for(const s of sources)this.run('INSERT INTO knowledge_sources VALUES(?,?,?,?)',id,s.url,s.title,verified);
    this.run('DELETE FROM knowledge_edges WHERE node_id=?',id);for(const other of related)this.run('INSERT INTO knowledge_edges VALUES(?,?)',id,other);
    this.reviseKnowledge(id,user,now);return this.rawNode(this.get('SELECT * FROM knowledge_nodes WHERE id=?',id)!,now);
  }
  private saveLecture(input: unknown,user: Row,now: number) {
    const a=fields(input,['id','expectedVersion','title','description','startsAt','endsAt','format','region','location','capacity','topics']);
    const id=a.id===undefined?randomUUID():text(a.id,'id',200),old=this.get('SELECT * FROM lectures WHERE id=?',id);
    if(old)this.version(old,a.expectedVersion);else if(a.expectedVersion!==undefined)fail('VERSION_CONFLICT','Foredraget findes ikke.');
    const title=text(a.title,'title',200),description=text(a.description,'description',5000),starts=timestamp(a.startsAt,'startsAt'),ends=timestamp(a.endsAt,'endsAt');
    if(ends<=starts||starts<=now)fail('INVALID_INPUT','Foredraget skal ligge i fremtiden med gyldig sluttid.');
    const format=validFormat(a.format),region=text(a.region,'region',200),location=text(a.location,'location',2000),capacity=integer(a.capacity,'capacity',1,100000),topics=strings(a.topics,'topics');
    if(format==='online'){let url:URL;try{url=new URL(location);}catch{return fail('INVALID_INPUT','Onlineforedrag kræver HTTPS-link.');}if(url.protocol!=='https:'||url.username||url.password)fail('INVALID_INPUT','Onlineforedrag kræver HTTPS-link uden credentials.');}
    for(const topic of topics)if(!this.get('SELECT 1 FROM knowledge_nodes WHERE id=?',topic))fail('NOT_FOUND','Emnet findes ikke.');
    if(old&&capacity<this.get("SELECT COUNT(*) n FROM registrations WHERE lecture_id=? AND status='registered'",id)!.n)fail('INVALID_INPUT','Kapacitet er lavere end antal tilmeldte.');
    this.run(`INSERT INTO lectures(id,title,description,starts_at,ends_at,format,region,location,capacity,status,version) VALUES(?,?,?,?,?,?,?,?,?,'draft',1)
      ON CONFLICT(id) DO UPDATE SET title=excluded.title,description=excluded.description,starts_at=excluded.starts_at,ends_at=excluded.ends_at,format=excluded.format,region=excluded.region,location=excluded.location,capacity=excluded.capacity,status='draft',version=lectures.version+1`,id,title,description,starts,ends,format,region,location,capacity);
    this.run('DELETE FROM lecture_topics WHERE lecture_id=?',id);for(const topic of topics)this.run('INSERT INTO lecture_topics VALUES(?,?)',id,topic);
    const row=this.get('SELECT * FROM lectures WHERE id=?',id)!;this.audit(user,'lecture_save',id,row.version,now);return this.lecture(row,user,now);
  }
}
