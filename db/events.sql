PRAGMA foreign_keys=ON;
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
