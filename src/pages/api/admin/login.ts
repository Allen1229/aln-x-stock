import type { APIRoute } from 'astro';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = context.locals.runtime?.env;
  if (!env?.ADMIN_PASSWORD_HASH || !env?.SESSION_SECRET) {
    return context.redirect('/admin/login?error=' + encodeURIComponent('伺服器未設定 admin 環境變數'));
  }

  const form = await context.request.formData();
  const password = String(form.get('password') ?? '');

  if (!(await verifyPassword(password, env.ADMIN_PASSWORD_HASH))) {
    return context.redirect('/admin/login?error=' + encodeURIComponent('密碼錯誤'));
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  setSessionCookie(context, token);
  return context.redirect('/admin');
};
