-- 在 comments 表加上原始 IP 與國家代碼
-- 用途：辨識惡意/濫用留言，僅供管理員後台查看，不會公開顯示

ALTER TABLE comments ADD COLUMN ip TEXT;
ALTER TABLE comments ADD COLUMN country TEXT;
