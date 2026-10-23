CREATE TABLE IF NOT EXISTS request_rate_limits (
 subject_hash TEXT NOT NULL,
 window_start INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 request_count INTEGER NOT NULL CHECK(request_count>0),
 PRIMARY KEY(subject_hash,window_start)
);
CREATE INDEX IF NOT EXISTS request_rate_limits_expiry ON request_rate_limits(expires_at);
