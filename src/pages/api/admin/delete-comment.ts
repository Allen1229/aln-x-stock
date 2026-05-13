import type { APIRoute } from 'astro';
import { isAdmin } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!(await isAdmin(context))) {
    return new Response('Unauthorized', { status: 401 });
  }
  const env = context.locals.runtime?.env;
  if (!env?.DB) return new Response('DB unavailable', { status: 500 });

  const form = await context.request.formData();
  const id = Number(form.get('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return new Response('Bad id', { status: 400 });
  }

  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  const back = String(form.get('redirect') ?? '/admin');
  return context.redirect(back);
};
