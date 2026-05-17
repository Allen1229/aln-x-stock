-- 標記「新手導讀文」：永遠置頂第一、且只能有一篇
-- 0 = 一般文章，1 = 新手導讀文

ALTER TABLE posts ADD COLUMN is_intro INTEGER NOT NULL DEFAULT 0;
