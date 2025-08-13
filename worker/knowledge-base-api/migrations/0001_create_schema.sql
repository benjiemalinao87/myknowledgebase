-- Create knowledge items table
CREATE TABLE IF NOT EXISTS knowledge_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('file', 'link', 'context')),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  file_type TEXT,
  size INTEGER,
  status TEXT DEFAULT 'active',
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
);

-- Create processing metadata table
CREATE TABLE IF NOT EXISTS processing_metadata (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  chunk_size INTEGER,
  token_count INTEGER,
  processing_time INTEGER,
  sentiment TEXT,
  complexity TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_items_type ON knowledge_items(type);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_status ON knowledge_items(status);
CREATE INDEX IF NOT EXISTS idx_tags_item_id ON tags(item_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);