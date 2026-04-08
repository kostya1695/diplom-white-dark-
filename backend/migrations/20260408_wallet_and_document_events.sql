-- Manual PostgreSQL migration for wallet and document events.
-- Project currently uses TypeORM synchronize; this file is a deployment reference.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS wallet_address varchar(255),
  ADD COLUMN IF NOT EXISTS wallet_private_key_encrypted text;

CREATE TABLE IF NOT EXISTS document_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  event_type varchar(50) NOT NULL,
  actor_email varchar(255),
  actor_wallet varchar(255),
  tx_hash varchar(255),
  comment text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
