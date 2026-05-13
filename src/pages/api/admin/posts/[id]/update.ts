import type { APIRoute } from 'astro';
import { isAdmin } from '@/lib/auth';
import { getPostById, updatePost } from '@/lib/posts';
import { parsePostForm } from '@/lib/post-form';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!(await isAdmin(context))) return new Response('Unauthorized', { status: 401 });
  const db = context.locals.runtime?.env?.DB;
  if (!db) return new Response('DB unavailable', { status: 500 });

  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) return new Response('Bad id', { status: 400 });

  const form = await context.request.formData();
  const parsed = parsePostForm(form);
  if (!parsed.ok) {
    return context.redirect(`/admin/posts/${id}/edit?error=` + encodeURIComponent(parsed.error));
  }

  try {
    const existing = await getPostById(db, id);
    const wasPinned = !!existing?.pinned_at;
    await updatePost(db, id, parsed.input, wasPinned);
    return context.redirect('/admin?saved=1');
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes('UNIQUE')) {
      return context.redirect(`/admin/posts/${id}/edit?error=` + encodeURIComponent('slug 已存在，請改一個'));
    }
    return context.redirect(`/admin/posts/${id}/edit?error=` + encodeURIComponent('儲存失敗：' + msg));
  }
};
