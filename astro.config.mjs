import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [tailwind()],
  site: 'https://artiseum.com.tw',
  // 關閉 Astro 內建 CSRF Origin 檢查
  // 原因：Cloudflare Pages 在某些情況會改寫 Origin header，
  //       導致同站 POST 被誤判為跨站。我們已用 HMAC session + bcrypt 自行做安全防護。
  security: {
    checkOrigin: false,
  },
});
