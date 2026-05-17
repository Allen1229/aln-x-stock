import { marked } from 'marked';

export type Outcome = 'profit' | 'loss' | null;

export interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tickers: string;
  tags: string;
  draft: number;
  pinned_at: number | null;
  outcome: Outcome;
  is_intro: number;
  view_count: number;
  published_at: number;
  updated_at: number;
}

export interface PostListItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  tickers: string;
  tags: string;
  draft: number;
  pinned_at: number | null;
  outcome: Outcome;
  is_intro: number;
  view_count: number;
  published_at: number;
  comment_count: number;
}

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

export function parseList(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export function joinList(arr: string[]): string {
  return arr.map((x) => x.trim()).filter(Boolean).join(',');
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9一-鿿-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export async function listPosts(
  db: D1Database,
  opts: { includeDrafts?: boolean } = {}
): Promise<PostListItem[]> {
  const where = opts.includeDrafts ? '' : 'WHERE p.draft = 0';
  const r = await db
    .prepare(
      `SELECT p.id, p.slug, p.title, p.description, p.tickers, p.tags, p.draft,
              p.pinned_at, p.outcome, p.is_intro, p.view_count, p.published_at,
              COUNT(c.id) AS comment_count
       FROM posts p
       LEFT JOIN comments c ON c.post_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.is_intro DESC,
                (p.pinned_at IS NOT NULL) DESC, p.pinned_at DESC,
                p.published_at DESC`
    )
    .all<PostListItem>();
  return r.results ?? [];
}

export async function getPostBySlug(db: D1Database, slug: string): Promise<Post | null> {
  const r = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<Post>();
  return r ?? null;
}

export async function incrementViewCount(db: D1Database, id: number): Promise<number> {
  const r = await db
    .prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ? RETURNING view_count')
    .bind(id)
    .first<{ view_count: number }>();
  return r?.view_count ?? 0;
}

export async function getPostById(db: D1Database, id: number): Promise<Post | null> {
  const r = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<Post>();
  return r ?? null;
}

export interface PostInput {
  slug: string;
  title: string;
  description: string;
  body: string;
  tickers: string;
  tags: string;
  draft: boolean;
  pinned: boolean;
  isIntro: boolean;
  outcome: Outcome;
  publishedAt: number;
}

/** 將其他文章的 is_intro 全部清掉，確保只有一篇導讀文 */
async function clearOtherIntros(db: D1Database, excludeId?: number): Promise<void> {
  if (excludeId === undefined) {
    await db.prepare('UPDATE posts SET is_intro = 0').run();
  } else {
    await db.prepare('UPDATE posts SET is_intro = 0 WHERE id != ?').bind(excludeId).run();
  }
}

export async function createPost(db: D1Database, input: PostInput): Promise<number> {
  const pinnedAt = input.pinned ? Math.floor(Date.now() / 1000) : null;
  const r = await db
    .prepare(
      `INSERT INTO posts (slug, title, description, body, tickers, tags, draft, pinned_at, outcome, is_intro, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    )
    .bind(
      input.slug,
      input.title,
      input.description,
      input.body,
      input.tickers,
      input.tags,
      input.draft ? 1 : 0,
      pinnedAt,
      input.outcome,
      input.isIntro ? 1 : 0,
      input.publishedAt
    )
    .first<{ id: number }>();
  const id = r!.id;
  if (input.isIntro) await clearOtherIntros(db, id);
  return id;
}

export async function updatePost(
  db: D1Database,
  id: number,
  input: PostInput,
  wasPinned: boolean
): Promise<void> {
  // 從未置頂變置頂時記下當下時間；維持置頂狀態則保留原本的 pinned_at（不洗牌）
  let pinnedExpr = 'pinned_at';
  let pinnedBind: number | null | undefined;
  if (input.pinned && !wasPinned) {
    pinnedExpr = '?';
    pinnedBind = Math.floor(Date.now() / 1000);
  } else if (!input.pinned) {
    pinnedExpr = '?';
    pinnedBind = null;
  }

  const sql = `UPDATE posts SET slug=?, title=?, description=?, body=?, tickers=?, tags=?, draft=?, pinned_at=${pinnedExpr}, outcome=?, is_intro=?, published_at=?, updated_at=unixepoch() WHERE id=?`;

  const binds: (string | number | null)[] = [
    input.slug,
    input.title,
    input.description,
    input.body,
    input.tickers,
    input.tags,
    input.draft ? 1 : 0,
  ];
  if (pinnedExpr === '?') binds.push(pinnedBind ?? null);
  binds.push(input.outcome);
  binds.push(input.isIntro ? 1 : 0);
  binds.push(input.publishedAt);
  binds.push(id);

  await db.prepare(sql).bind(...binds).run();

  if (input.isIntro) await clearOtherIntros(db, id);
}

export async function deletePost(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
}
