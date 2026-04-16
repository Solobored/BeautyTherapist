CREATE TABLE IF NOT EXISTS seller_auth_credentials (
  seller_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash TEXT NOT NULL,
  password_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_auth_credentials_email
  ON seller_auth_credentials(email);

CREATE INDEX IF NOT EXISTS idx_seller_auth_sessions_seller_id
  ON seller_auth_sessions(seller_id);

CREATE INDEX IF NOT EXISTS idx_seller_auth_sessions_active
  ON seller_auth_sessions(seller_id, expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE seller_auth_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_auth_sessions ENABLE ROW LEVEL SECURITY;
