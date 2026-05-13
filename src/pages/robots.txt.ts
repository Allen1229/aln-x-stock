import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';

export const prerender = false;

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${new URL('/sitemap.xml', SITE.url).toString()}
`;
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
};
