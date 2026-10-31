import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('NUM PAGES:', pages.length);
  for (const p of pages) console.log(' -', p.url(), '|', await p.title().catch(()=>'' ));
  await browser.close();
})();
