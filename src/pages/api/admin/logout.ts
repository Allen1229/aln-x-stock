import type { APIRoute } from 'astro';
import { clearSessionCookie } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  clearSessionCookie(context);
  return context.redirect('/');
};
