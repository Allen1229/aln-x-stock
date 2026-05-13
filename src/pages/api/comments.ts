import type { APIRoute } from 'astro';
import { verifyTurnstile, hashIp } from '@/lib/turnstile';

export const prerender = false;

function bad(error: string, status = 400) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime?.env;
  if (!env?.DB) return bad('資料庫尚未設定', 500);

  const form = await context.request.formData();
  const postId = Number(form.get('postId'));
  const author = String(form.get('author') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();
  const turnstileToken = form.get('cf-turnstile-response');

  if (!Number.isInteger(postId) || postId <= 0) return bad('缺少文章識別');
  if (!author || author.length > 32) return bad('暱稱必填且不超過 32 字');
  if (!body || body.length > 2000) return bad('內容必填且不超過 2000 字');

  const post = await env.DB.prepare('SELECT id FROM posts WHERE id = ? AND draft = 0').bind(postId).first();
  if (!post) return bad('文章不存在');

  let ip: string | null =
    context.request.headers.get('cf-connecting-ip') ??
    context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null;
  if (!ip) {
    try {
      ip = context.clientAddress ?? null;
    } catch {
      ip = null;
    }
  }
  const country = context.request.headers.get('cf-ipcountry') ?? null;

  const ok = await verifyTurnstile(
    typeof turnstileToken === 'string' ? turnstileToken : null,
    env.TURNSTILE_SECRET_KEY,
    ip
  );
  if (!ok) return bad('驗證失敗，請重試');

  const ipHash = ip && env.SESSION_SECRET ? await hashIp(ip, env.SESSION_SECRET) : null;

  await env.DB.prepare(
    'INSERT INTO comments (post_id, author, body, ip_hash, ip, country) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(postId, author, body, ipHash, ip, country)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
};
