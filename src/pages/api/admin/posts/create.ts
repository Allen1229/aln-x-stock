import type { APIRoute } from 'astro';
import { isAdmin } from '@/lib/auth';
import { createPost } from '@/lib/posts';
import { parsePostForm } from '@/lib/post-form';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!(await isAdmin(context))) return new Response('Unauthorized', { status: 401 });
  const db = context.locals.runtime?.env?.DB;
  if (!db) return new Response('DB unavailable', { status: 500 });

  const form = await context.request.formData();
  const parsed = parsePostForm(form);
  if (!parsed.ok) {
    return context.redirect('/admin/posts/new?error=' + encodeURIComponent(parsed.error));
  }

  try {
    await createPost(db, parsed.input);
    return context.redirect('/admin');
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes('UNIQUE')) {
      return context.redirect('/admin/posts/new?error=' + encodeURIComponent('slug 已存在，請改一個'));
    }
    return context.redirect('/admin/posts/new?error=' + encodeURIComponent('儲存失敗：' + msg));
  }
};
