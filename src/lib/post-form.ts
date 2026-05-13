import type { PostInput, Outcome } from './posts';
import { slugify, joinList, parseList } from './posts';

export type ParseResult =
  | { ok: true; input: PostInput }
  | { ok: false; error: string };

export function parsePostForm(form: FormData): ParseResult {
  const title = String(form.get('title') ?? '').trim();
  if (!title) return { ok: false, error: '標題必填' };
  if (title.length > 120) return { ok: false, error: '標題不超過 120 字' };

  const body = String(form.get('body') ?? '').trim();
  if (!body) return { ok: false, error: '內容必填' };

  const description = String(form.get('description') ?? '').trim().slice(0, 200);
  const tickers = joinList(parseList(String(form.get('tickers') ?? '')));
  const tags = joinList(parseList(String(form.get('tags') ?? '')));
  const draft = form.get('draft') === '1';
  const pinned = form.get('pinned') === '1';
  const outcomeRaw = String(form.get('outcome') ?? '');
  const outcome: Outcome =
    outcomeRaw === 'profit' ? 'profit' : outcomeRaw === 'loss' ? 'loss' : null;

  let slug = String(form.get('slug') ?? '').trim();
  if (!slug) slug = slugify(title);
  if (!slug) slug = `post-${Date.now()}`;
  if (slug.length > 80) slug = slug.slice(0, 80);

  const dateStr = String(form.get('publishedAt') ?? '').trim();
  let publishedAt: number;
  if (dateStr) {
    const d = new Date(dateStr + 'T00:00:00Z');
    if (Number.isNaN(d.valueOf())) return { ok: false, error: '日期格式錯誤' };
    publishedAt = Math.floor(d.valueOf() / 1000);
  } else {
    publishedAt = Math.floor(Date.now() / 1000);
  }

  return {
    ok: true,
    input: { slug, title, description, body, tickers, tags, draft, pinned, outcome, publishedAt },
  };
}
