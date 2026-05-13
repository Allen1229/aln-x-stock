-- 在現有資料庫加上 pinned_at 欄位（不丟資料）
-- 已建立過 schema.sql 的人跑這個就好；新環境直接跑 schema.sql 即可。

ALTER TABLE posts ADD COLUMN pinned_at INTEGER;
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(pinned_at DESC) WHERE pinned_at IS NOT NULL;
