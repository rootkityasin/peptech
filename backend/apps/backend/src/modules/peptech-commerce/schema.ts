// The commerce ledger is owned by this module. Never mutate it from route handlers.
export const schema = `
CREATE TABLE IF NOT EXISTS peptech_commerce_record (
  id text PRIMARY KEY, kind text NOT NULL, profile text NOT NULL,
  owner_id text, state text NOT NULL, data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS peptech_commerce_owner ON peptech_commerce_record(kind, profile, owner_id);
CREATE INDEX IF NOT EXISTS peptech_commerce_work ON peptech_commerce_record(kind, state, updated_at);
CREATE TABLE IF NOT EXISTS peptech_commerce_audit (
  id bigserial PRIMARY KEY, record_id text NOT NULL, actor_id text NOT NULL,
  action text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
`;
