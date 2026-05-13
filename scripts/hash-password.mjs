#!/usr/bin/env node
// 用法：npm run hash <你的密碼>
// 將輸出的 hash 設定到 Cloudflare Pages 環境變數 ADMIN_PASSWORD_HASH
import bcrypt from 'bcryptjs';

const pw = process.argv[2];
if (!pw) {
  console.error('用法: npm run hash <密碼>');
  process.exit(1);
}
const hash = bcrypt.hashSync(pw, 12);
console.log('\nADMIN_PASSWORD_HASH=');
console.log(hash);
console.log('\n請複製上方 hash 字串，貼到 Cloudflare Pages 的環境變數設定 (Encrypted)\n');
