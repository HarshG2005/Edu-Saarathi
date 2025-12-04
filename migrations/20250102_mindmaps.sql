DROP TABLE IF EXISTS mindmap_snapshots;
DROP TABLE IF EXISTS mindmaps;

CREATE TABLE mindmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Untitled Mindmap' NOT NULL,
  graph JSONB NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE mindmap_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE,
  graph JSONB NOT NULL,
  note TEXT,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_mindmaps_user_doc ON mindmaps(user_id, document_id);
