-- ALN X Stock 資料庫結構
-- 文章與留言都存在 D1

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  tickers TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  draft INTEGER NOT NULL DEFAULT 0,
  pinned_at INTEGER,
  outcome TEXT,
  published_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_posts_published ON posts(draft, published_at DESC);
CREATE INDEX idx_posts_pinned ON posts(pinned_at DESC) WHERE pinned_at IS NOT NULL;

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  ip_hash TEXT,
  ip TEXT,
  country TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at DESC);
