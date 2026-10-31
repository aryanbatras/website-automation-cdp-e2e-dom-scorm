import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  console.log('URL:', page.url());
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a,button')).map(e => ({ tag:e.tagName, text: e.innerText.trim().slice(0,60), href: e.href })).filter(l=>l.text));
  console.log(JSON.stringify(links, null, 2));
  await browser.close();
})();