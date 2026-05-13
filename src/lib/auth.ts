import bcrypt from 'bcryptjs';
import type { APIContext } from 'astro';

const SESSION_COOKIE = 'aln_admin';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = `admin.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [role, ts, nonce, sig] = parts;
  if (role !== 'admin') return false;
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE * 1000) return false;
  const expected = await hmac(secret, `${role}.${ts}.${nonce}`);
  return timingSafeEqual(sig, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function setSessionCookie(context: APIContext, token: string) {
  context.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(context: APIContext) {
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function isAdmin(context: APIContext): Promise<boolean> {
  const env = context.locals.runtime?.env;
  if (!env?.SESSION_SECRET) return false;
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token, env.SESSION_SECRET);
}
