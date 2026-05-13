-- 在 posts 表加上「操作結果」欄位
-- 值為 'profit'（獲利）、'loss'（虧損），或 NULL（未標記）

ALTER TABLE posts ADD COLUMN outcome TEXT;
