-- Provisioned at runtime, never bundled with a key value. D1 backups are secrets.
CREATE TABLE IF NOT EXISTS app_secrets (
 name TEXT PRIMARY KEY CHECK(name='event-encryption-key'),
 secret_value TEXT NOT NULL CHECK(length(secret_value)=64)
);
