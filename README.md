# ALN X Stock

台股個股操作分享部落格 · Astro + Cloudflare Pages + D1

## 技術堆疊
- **Astro 5** + MDX（文章用檔案管理）
- **Tailwind CSS**（深色主題）
- **Cloudflare Pages**（託管）
- **Cloudflare D1**（留言資料庫）
- **bcryptjs**（密碼雜湊）
- **Cloudflare Turnstile**（防機器人，可選）

## 目錄結構
```
src/
  content/posts/        ← 文章 (.mdx)
  pages/                ← 路由
    index.astro         首頁
    posts/[...slug]     文章頁
    admin/              後台
    api/                API
  components/
  layouts/
  config/site.ts        ← 站台設定（網址、廣告）
  lib/                  auth, format, turnstile
public/
  ads/                  廣告圖片
schema.sql              D1 schema
wrangler.toml           Cloudflare 設定
```

## 首次設定

```bash
# 1. 安裝
npm install

# 2. 建立本機環境變數
cp .dev.vars.example .dev.vars
# 編輯 .dev.vars，填入 ADMIN_PASSWORD_HASH（用下方指令產生）和 SESSION_SECRET

# 3. 產生密碼 hash
npm run hash YourPasswordHere

# 4. 建立 D1 資料庫
npx wrangler d1 create aln-x-stock-db
# 把回傳的 database_id 填到 wrangler.toml

# 5. 初始化本機 D1
npm run db:init:local

# 6. 啟動開發伺服器
npm run dev
```

## 部署到 Cloudflare Pages

```bash
# 1. 初始化遠端 D1
npm run db:init:remote

# 2. 部署
npm run deploy
```

在 Cloudflare Pages 後台設定環境變數（標記為 Encrypt）：
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `TURNSTILE_SITE_KEY`（可選）
- `TURNSTILE_SECRET_KEY`（可選）
- `SITE_URL`（之後換網址只需改這個）

並在 Settings → Functions → D1 database bindings 綁定 `DB` → `aln-x-stock-db`。

## 寫新文章
在 `src/content/posts/` 新增 `.mdx` 檔，frontmatter 範例：
```yaml
---
title: "文章標題"
description: "摘要"
publishedAt: 2026-05-13
tags: ["波段"]
tickers: ["2330"]
draft: false
---
```
存檔 → `git push` → Cloudflare 自動部署。

## 備份
```bash
# 手動匯出留言資料庫
npm run db:backup
```
建議搭配 GitHub Actions 每日自動跑 `db:backup` 並 commit 到 repo 或上傳 R2。

## 後台
- 登入：`/admin/login`
- 管理：`/admin`（文章列表、刪除留言）
