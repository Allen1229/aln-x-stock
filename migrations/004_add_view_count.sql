-- 在 posts 表加上瀏覽計數

ALTER TABLE posts ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
