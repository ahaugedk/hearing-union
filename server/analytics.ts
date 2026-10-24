import type { Database } from './storage.js';
// The statistic store accepts only enumerated operations and outcomes: caller input is never a metric key.
const tools = new Set([
    'get_profile', 'update_preferences', 'delete_account', 'knowledge_search', 'knowledge_get', 'knowledge_children',
    'lecture_search', 'lecture_get', 'lecture_register', 'lecture_unregister', 'my_registrations',
    'admin_knowledge_list', 'admin_knowledge_save', 'admin_knowledge_publish', 'admin_lecture_save',
    'admin_lecture_list', 'admin_lecture_publish', 'admin_lecture_cancel', 'admin_lecture_registrations', 'admin_audit_log',
    'admin_usage_report', 'owner_list_admins', 'owner_set_admin', 'event_delivery',
    'events/list', 'events/subscribe', 'events/unsubscribe',
]);
const outcomes = new Set(['success', 'NOT_FOUND', 'EXPIRED', 'FORBIDDEN', 'FULL', 'VERSION_CONFLICT', 'INVALID_INPUT', 'CONFLICT', 'NOT_AVAILABLE', 'UNKNOWN_TOOL', 'INTERNAL_ERROR', 'DELIVERY_FAILED']);
export const MINIMUM_TOPIC_COUNT = 5;
export type UsageGroup = 'date' | 'tool' | 'topic' | 'outcome';
export type TopicAction = 'search_result' | 'direct_lookup' | 'tree_result';
/** Aggregate only. No subject, query, callback URL or per-request record is accepted or retained. */
export async function recordUsage(db: Database, tool: string, outcome: string, now: number, topics?: {
    action: TopicAction;
    ids: string[];
}) {
    const date = new Date(now).toISOString().slice(0, 10);
    const operation = tools.has(tool) ? tool : 'unknown_tool';
    const result = outcomes.has(outcome) ? outcome : 'INTERNAL_ERROR';
    const upsert = db.prepare(`INSERT INTO usage_daily(date,tool,outcome,action,topic_id,count) VALUES(?,?,?,?,?,?)
    ON CONFLICT(date,tool,outcome,action,topic_id) DO UPDATE SET count=count+excluded.count`);
    await upsert.run(date, operation, result, 'call', '', 1);
    if (result === 'success' && topics) {
        for (const id of new Set(topics.ids))
            await upsert.run(date, operation, result, topics.action, id, 1);
    }
}
/** Input bounds and administrator authorization are enforced by the shared domain before calling. */
export async function usageReport(db: Database, from: number, to: number, groupBy: UsageGroup) {
    const fromDate = new Date(from).toISOString().slice(0, 10);
    const toDate = new Date(to).toISOString().slice(0, 10);
    // Only the fixed grouping map contributes SQL syntax. Date values are bound parameters.
    const columns = { date: 'u.date', tool: 'u.tool', outcome: 'u.outcome', topic: 'u.topic_id' } as const;
    const column = columns[groupBy];
    const topic = groupBy === 'topic';
    const rows = await db.prepare(topic
        ? `WITH topic_counts AS (
         SELECT u.topic_id key,COALESCE(n.title,'Emne fjernet') label,SUM(u.count) count
         FROM usage_daily u LEFT JOIN knowledge_nodes n ON n.id=u.topic_id
         WHERE u.date>=? AND u.date<=? AND u.action IN ('search_result','direct_lookup','tree_result') AND u.topic_id<>''
         GROUP BY u.topic_id
       ) SELECT key,label,count FROM topic_counts
         WHERE NOT EXISTS(SELECT 1 FROM topic_counts WHERE count<${MINIMUM_TOPIC_COUNT})
         ORDER BY count DESC,key LIMIT 500`
        : `SELECT ${column} key,${column} label,SUM(u.count) count FROM usage_daily u
       WHERE u.date>=? AND u.date<=? AND u.action='call'
       GROUP BY ${column} ORDER BY ${column} LIMIT 500`).all(fromDate, toDate) as {
        key: string;
        label: string;
        count: number;
    }[];
    // No overall topic total or suppressed-row count: these could expose a suppressed topic by subtraction.
    return {
        from: fromDate,
        to: toDate,
        groupBy,
        unit: topic ? 'topic_interactions' : 'calls',
        minimumTopicCount: MINIMUM_TOPIC_COUNT,
        items: rows,
        total: rows.reduce((sum, row) => sum + row.count, 0),
        description: topic ? 'Emnegrupper vises kun, når alle emnegrupper i perioden har mindst fem visninger. Ellers vises ingen emnegrupper; vælg eventuelt en anden periode. Tællere er visninger, ikke personer.' : 'Tællere er værktøjskald, ikke unikke brugere. Eventlevering betyder modtaget webhook, ikke læst besked.',
    };
}
