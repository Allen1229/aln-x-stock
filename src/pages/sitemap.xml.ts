import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';
import { listPosts } from '@/lib/posts';

export const prerender = false;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async (context) => {
  const db = context.locals.runtime?.env?.DB;
  const posts = db ? await listPosts(db) : [];

  const now = new Date().toISOString();
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
    { url: '/about', changefreq: 'monthly', priority: '0.5', lastmod: now },
    { url: '/privacy', changefreq: 'yearly', priority: '0.3', lastmod: now },
  ];

  const urls = [
    ...staticPages.map((p) => `  <url>
    <loc>${xmlEscape(new URL(p.url, SITE.url).toString())}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...posts.map((p) => {
      const lastmod = new Date(p.published_at * 1000).toISOString();
      return `  <url>
    <loc>${xmlEscape(new URL(`/posts/${p.slug}`, SITE.url).toString())}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
