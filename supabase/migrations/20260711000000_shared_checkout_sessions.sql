-- Shared checkout sessions table for generating short links instead of long URLs
CREATE TABLE IF NOT EXISTS shared_checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  session_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ
);

-- Index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_shared_checkout_sessions_token ON shared_checkout_sessions(token);

-- Index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_shared_checkout_sessions_expires_at ON shared_checkout_sessions(expires_at);

-- Auto-cleanup policy: delete expired sessions older than 7 days
-- (You can run this manually or set up a cron job)
COMMENT ON TABLE shared_checkout_sessions IS 
  'Stores shared checkout session data with short tokens for buyer preview links';
