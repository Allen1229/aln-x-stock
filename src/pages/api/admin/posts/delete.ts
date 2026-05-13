import type { APIRoute } from 'astro';
import { isAdmin } from '@/lib/auth';
import { deletePost } from '@/lib/posts';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!(await isAdmin(context))) return new Response('Unauthorized', { status: 401 });
  const db = context.locals.runtime?.env?.DB;
  if (!db) return new Response('DB unavailable', { status: 500 });

  const form = await context.request.formData();
  const id = Number(form.get('id'));
  if (!Number.isInteger(id) || id <= 0) return new Response('Bad id', { status: 400 });

  await deletePost(db, id);
  return context.redirect('/admin');
};
