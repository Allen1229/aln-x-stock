import { defineMiddleware } from 'astro:middleware';

/**
 * 全站 HTTP 標頭中介層：
 * - 後台與 API：完全禁止搜尋引擎收錄與快取
 * - 全站：附加標準安全性標頭
 *
 * 註：Cloudflare Pages 的 _headers 檔案只對靜態檔案有效，
 *     SSR 路由必須在這裡程式化設定。
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const path = context.url.pathname;

  // 後台與 API：禁止收錄
  if (path.startsWith('/admin') || path.startsWith('/api')) {
    response.headers.set(
      'X-Robots-Tag',
      'noindex, nofollow, noarchive, nosnippet, noimageindex'
    );
    response.headers.set(
      'Cache-Control',
      'private, no-store, no-cache, must-revalidate'
    );
    response.headers.set('Referrer-Policy', 'no-referrer');
  }

  // 全站基本安全標頭（不覆蓋上面已設定的 Referrer-Policy）
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  if (!response.headers.has('Referrer-Policy')) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
});
