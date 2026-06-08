CREATE SCHEMA IF NOT EXISTS project_model;

CREATE TABLE IF NOT EXISTS project_model.import_batch (
  import_batch_id bigserial PRIMARY KEY,
  batch_key text NOT NULL,
  template_key text NOT NULL,
  importer_name text NOT NULL,
  importer_version text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT ck_project_model_import_batch_status
    CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_model_import_batch_key
  ON project_model.import_batch(batch_key);

CREATE TABLE IF NOT EXISTS project_model.import_record_event (
  import_record_event_id bigserial PRIMARY KEY,
  import_batch_id bigint NOT NULL REFERENCES project_model.import_batch(import_batch_id) ON DELETE CASCADE,
  record_family text NOT NULL,
  natural_key text NOT NULL,
  prior_content_hash text,
  content_hash text,
  change_status text NOT NULL,
  active_record_table text,
  active_record_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_project_model_import_record_event_status
    CHECK (change_status IN ('added', 'removed', 'changed', 'unchanged'))
);

CREATE INDEX IF NOT EXISTS idx_project_model_import_record_event_batch
  ON project_model.import_record_event(import_batch_id, record_family, change_status);

CREATE TABLE IF NOT EXISTS project_model.template (
  template_id bigserial PRIMARY KEY,
  template_key text NOT NULL,
  version text NOT NULL,
  name text NOT NULL,
  status text NOT NULL,
  source_path text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  natural_key text NOT NULL,
  content_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  superseded_by_id bigint REFERENCES project_model.template(template_id),
  created_import_batch_id bigint REFERENCES project_model.import_batch(import_batch_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_project_model_template_status
    CHECK (status IN ('draft', 'active', 'deprecated'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_model_template_active_key
  ON project_model.template(natural_key)
  WHERE is_active;

CREATE TABLE IF NOT EXISTS project_model.model_node (
  model_node_id bigserial PRIMARY KEY,
  template_id bigint REFERENCES project_model.template(template_id) ON DELETE CASCADE,
  node_key text NOT NULL,
  node_type text NOT NULL,
  display_label text NOT NULL,
  source_path text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  natural_key text NOT NULL,
  content_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  superseded_by_id bigint REFERENCES project_model.model_node(model_node_id),
  created_import_batch_id bigint REFERENCES project_model.import_batch(import_batch_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_project_model_model_node_type
    CHECK (node_type IN ('module', 'api', 'screen', 'workflow', 'decision', 'wiki_page'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_model_model_node_active_key
  ON project_model.model_node(natural_key)
  WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_project_model_model_node_type
  ON project_model.model_node(node_type, node_key)
  WHERE is_active;

CREATE TABLE IF NOT EXISTS project_model.patch_proposal (
  patch_proposal_id bigserial PRIMARY KEY,
  patch_key text NOT NULL,
  target_file text NOT NULL,
  base_hash text NOT NULL,
  proposal_source text NOT NULL,
  rationale text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  natural_key text NOT NULL,
  content_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  superseded_by_id bigint REFERENCES project_model.patch_proposal(patch_proposal_id),
  created_import_batch_id bigint REFERENCES project_model.import_batch(import_batch_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_project_model_patch_proposal_source
    CHECK (proposal_source IN ('web-ui', 'cli', 'llm', 'human')),
  CONSTRAINT ck_project_model_patch_proposal_status
    CHECK (status IN ('pending', 'accepted', 'rejected', 'superseded'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_model_patch_proposal_active_key
  ON project_model.patch_proposal(natural_key)
  WHERE is_active;
