// 集中管理網站資訊，未來換網址只需改 SITE_URL 環境變數
export const SITE = {
  url: import.meta.env.SITE_URL ?? 'https://aln-x-stock.pages.dev',
  title: '股海冥燈 - 艾倫大叔',
  shortTitle: '股海冥燈 - 艾倫大叔',
  description: '股票市場上，常常是一個反指標 — 艾倫大叔的台股個股操作紀錄與心得分享，不報明牌，只分享真實的操作與檢討。',
  keywords: ['台股', '個股操作', '投資紀錄', '股市心得', '艾倫大叔', '股海冥燈', '反指標'],
  author: '艾倫大叔',
  ogImage: '/hero/main.png',
  locale: 'zh_TW',
  nav: [
    { href: '/', label: '首頁' },
    { href: '/about', label: '關於' },
  ],
};

// 首頁主視覺（圖 + 自我介紹）
export const HERO = {
  enabled: true,
  imageUrl: '/hero/main.png',
  imageAlt: '股海冥燈 主視覺',
  headline: '我是艾倫大叔：那個親手熄滅冥燈的男人',
  attribution: '',
  body: `大家好，我是艾倫。在江湖上，有人叫我「股海冥燈」——因為我曾擁有那種「買了就跌、賣了就噴」的特異功能。

但我發現，與其當別人的反向指標，不如把這些踩過的坑、流過的淚，變成一套「大叔避雷指南」。在這裡，我不報明牌，我只分享最真實的個股操作紀錄。

如果你厭倦了聽投顧老師吹牛，想看一個真實投資人如何從「冥燈」進化成「明燈」，歡迎跟著艾倫大叔一起，我們不求大富大貴，但求在股海裡活得久、睡得著。`,
};

// 廣告區塊設定（未來可改成從資料庫讀取）
export const AD = {
  enabled: true,
  imageUrl: '/ads/main.png',
  headline: 'iPhone 17 買不到？下載遊戲<span class="text-red-500 font-bold">玩星派對</span>，遊玩並完成驗證免費抽回家!',
  body: '進入遊戲遊玩，並完成手機驗證，即有機會獲得 iPhone 17、7-ELEVEN 虛擬商品卡等豐富好禮。',
  linkUrl: 'https://www.gametower.com.tw/Action/partygo/mixytalk0416/index.html?utm_source=aln-x-stock&utm_medium=display&utm_campaign=mega_traffic_2026&utm_content=1st_banner',
};

export const DISCLAIMER =
  '本站內容僅為個人操作紀錄與心得分享，不構成任何投資建議。投資人應自行判斷風險，盈虧自負。';
