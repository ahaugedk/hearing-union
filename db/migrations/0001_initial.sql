-- Generated from db/*.sql before first production v1. Do not edit.

CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, auth_subject TEXT NOT NULL UNIQUE,
 role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin','owner')), created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS one_owner ON users(role) WHERE role='owner';
CREATE TABLE IF NOT EXISTS user_preferences (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 format TEXT NOT NULL DEFAULT 'any' CHECK(format IN ('any','physical','online')), version INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS knowledge_nodes (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, parent_id TEXT REFERENCES knowledge_nodes(id),
 title TEXT NOT NULL, summary TEXT NOT NULL, keywords_json TEXT NOT NULL DEFAULT '[]',
 status TEXT NOT NULL CHECK(status IN ('draft','published','archived')), expires_at INTEGER,
 verified_at INTEGER NOT NULL, version INTEGER NOT NULL DEFAULT 1, CHECK(parent_id IS NULL OR parent_id<>id)
);
CREATE INDEX IF NOT EXISTS knowledge_parent ON knowledge_nodes(parent_id);
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(id UNINDEXED, title, summary, keywords, tokenize='unicode61');
CREATE TRIGGER IF NOT EXISTS knowledge_fts_insert AFTER INSERT ON knowledge_nodes BEGIN
 INSERT INTO knowledge_fts(id,title,summary,keywords) VALUES(new.id,new.title,new.summary,new.keywords_json);
END;
CREATE TRIGGER IF NOT EXISTS knowledge_fts_update AFTER UPDATE ON knowledge_nodes BEGIN
 DELETE FROM knowledge_fts WHERE id=old.id;
 INSERT INTO knowledge_fts(id,title,summary,keywords) VALUES(new.id,new.title,new.summary,new.keywords_json);
END;
CREATE TRIGGER IF NOT EXISTS knowledge_fts_delete AFTER DELETE ON knowledge_nodes BEGIN
 DELETE FROM knowledge_fts WHERE id=old.id;
END;
CREATE TABLE IF NOT EXISTS knowledge_sources (
 node_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
 url TEXT NOT NULL, title TEXT NOT NULL, verified_at INTEGER NOT NULL, PRIMARY KEY(node_id,url)
);
CREATE TABLE IF NOT EXISTS knowledge_edges (
 node_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
 related_id TEXT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
 PRIMARY KEY(node_id,related_id), CHECK(node_id<>related_id)
);
CREATE TABLE IF NOT EXISTS knowledge_revisions (
 id INTEGER PRIMARY KEY, node_id TEXT NOT NULL REFERENCES knowledge_nodes(id),
 actor_id TEXT REFERENCES users(id) ON DELETE SET NULL, version INTEGER NOT NULL,
 snapshot_json TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(node_id,version)
);
CREATE TABLE IF NOT EXISTS user_topic_preferences (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, topic_id TEXT NOT NULL REFERENCES knowledge_nodes(id),
 PRIMARY KEY(user_id,topic_id)
);
CREATE TABLE IF NOT EXISTS user_region_preferences (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, region TEXT NOT NULL,
 PRIMARY KEY(user_id,region)
);
CREATE TABLE IF NOT EXISTS lectures (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
 starts_at INTEGER NOT NULL, ends_at INTEGER NOT NULL, format TEXT NOT NULL CHECK(format IN ('physical','online')),
 region TEXT NOT NULL, location TEXT NOT NULL, capacity INTEGER NOT NULL CHECK(capacity>0),
 status TEXT NOT NULL CHECK(status IN ('draft','published','cancelled')), version INTEGER NOT NULL DEFAULT 1,
 CHECK(ends_at>starts_at)
);
CREATE INDEX IF NOT EXISTS lectures_search ON lectures(status,starts_at);
CREATE TABLE IF NOT EXISTS lecture_topics (
 lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE, topic_id TEXT NOT NULL REFERENCES knowledge_nodes(id),
 PRIMARY KEY(lecture_id,topic_id)
);
CREATE INDEX IF NOT EXISTS lecture_topics_topic ON lecture_topics(topic_id,lecture_id);
CREATE TABLE IF NOT EXISTS registrations (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
 status TEXT NOT NULL CHECK(status IN ('registered','cancelled')), created_at INTEGER NOT NULL,
 PRIMARY KEY(user_id,lecture_id)
);
CREATE INDEX IF NOT EXISTS registration_capacity ON registrations(lecture_id,status);
CREATE TABLE IF NOT EXISTS outbox_events (
 id TEXT PRIMARY KEY, event_name TEXT NOT NULL, lecture_id TEXT NOT NULL REFERENCES lectures(id),
 lecture_version INTEGER NOT NULL, created_at INTEGER NOT NULL, UNIQUE(event_name,lecture_id,lecture_version)
);
CREATE TABLE IF NOT EXISTS admin_audit (
 id INTEGER PRIMARY KEY, actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 action TEXT NOT NULL, target_id TEXT NOT NULL, version INTEGER, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS usage_daily (
 date TEXT NOT NULL, tool TEXT NOT NULL, outcome TEXT NOT NULL,
 action TEXT NOT NULL CHECK(action IN ('call','search_result','direct_lookup','tree_result')),
 topic_id TEXT NOT NULL DEFAULT '', count INTEGER NOT NULL DEFAULT 0 CHECK(count>=0),
 PRIMARY KEY(date,tool,outcome,action,topic_id),
 CHECK((action='call' AND topic_id='') OR (action<>'call' AND topic_id<>''))
);


CREATE TABLE IF NOT EXISTS event_subscriptions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 event_name TEXT NOT NULL, arguments_json TEXT NOT NULL, callback_url TEXT NOT NULL,
 secret_ciphertext TEXT NOT NULL, old_secret_ciphertext TEXT, rotation_until INTEGER,
 status TEXT NOT NULL CHECK(status IN ('verifying','active','inactive','failed')),
 generation INTEGER NOT NULL DEFAULT 1, operation_generation INTEGER NOT NULL DEFAULT 0, activated_at INTEGER NOT NULL,
 start_outbox_rowid INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS subscriptions_active ON event_subscriptions(status,expires_at,id);
CREATE TABLE IF NOT EXISTS event_deliveries (
 event_id TEXT NOT NULL REFERENCES outbox_events(id) ON DELETE CASCADE,
 subscription_id TEXT NOT NULL REFERENCES event_subscriptions(id) ON DELETE CASCADE,
 generation INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','skipped','failed')),
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at INTEGER NOT NULL,
 lease_token TEXT, lease_until INTEGER, error_code TEXT,
 PRIMARY KEY(event_id,subscription_id)
);
CREATE INDEX IF NOT EXISTS delivery_due ON event_deliveries(status,next_attempt_at,lease_until);
CREATE TABLE IF NOT EXISTS event_fanout (
 event_id TEXT PRIMARY KEY REFERENCES outbox_events(id) ON DELETE CASCADE,
 last_subscription_id TEXT NOT NULL DEFAULT '', complete INTEGER NOT NULL DEFAULT 0 CHECK(complete IN (0,1))
);

CREATE INDEX IF NOT EXISTS fanout_pending ON event_fanout(complete,event_id);
CREATE TABLE IF NOT EXISTS event_fanout_state (id INTEGER PRIMARY KEY CHECK(id=1),last_outbox_rowid INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO event_fanout_state(id,last_outbox_rowid) VALUES(1,0);

CREATE TABLE IF NOT EXISTS event_callback_verifications (
 cache_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS request_rate_limits (
 subject_hash TEXT NOT NULL,
 window_start INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 request_count INTEGER NOT NULL CHECK(request_count>0),
 PRIMARY KEY(subject_hash,window_start)
);
CREATE INDEX IF NOT EXISTS request_rate_limits_expiry ON request_rate_limits(expires_at);

CREATE TABLE IF NOT EXISTS app_revision (id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO app_revision(id,revision) VALUES(1,0);
CREATE TABLE IF NOT EXISTS app_commit_guard (id INTEGER PRIMARY KEY CHECK(id=1),valid INTEGER NOT NULL CONSTRAINT app_revision_conflict CHECK(valid=1));

-- Provisioned at runtime, never bundled with a key value. D1 backups are secrets.
CREATE TABLE IF NOT EXISTS app_secrets (
 name TEXT PRIMARY KEY CHECK(name='event-encryption-key'),
 secret_value TEXT NOT NULL CHECK(length(secret_value)=64)
);
