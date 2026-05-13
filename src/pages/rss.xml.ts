import type { APIRoute } from 'astro';
import { SITE } from '@/config/site';
import { listPosts, renderMarkdown, getPostBySlug } from '@/lib/posts';

export const prerender = false;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export const GET: APIRoute = async (context) => {
  const db = context.locals.runtime?.env?.DB;
  const posts = db ? await listPosts(db) : [];

  const recent = posts.slice(0, 20);

  // RSS 內含完整文章內容（HTML）
  const items = await Promise.all(
    recent.map(async (p) => {
      const full = db ? await getPostBySlug(db, p.slug) : null;
      const url = new URL(`/posts/${p.slug}`, SITE.url).toString();
      const pubDate = new Date(p.published_at * 1000).toUTCString();
      const html = full ? renderMarkdown(full.body) : '';
      return `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${cdata(p.description || p.title)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
      <author>noreply@${new URL(SITE.url).host} (${SITE.author})</author>
    </item>`;
    })
  );

  const lastBuild = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE.title)}</title>
    <link>${xmlEscape(SITE.url)}</link>
    <atom:link href="${xmlEscape(new URL('/rss.xml', SITE.url).toString())}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(SITE.description)}</description>
    <language>zh-Hant-TW</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=1800',
    },
  });
};
