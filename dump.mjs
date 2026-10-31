import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('skillsbuild')) || context.pages()[0];
  console.log('URL:', page.url());
  // Print all links
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim().slice(0,80), href: a.href })).filter(l=>l.text));
  console.log('LINKS:', JSON.stringify(links.slice(0,60), null, 2));
  // Buttons
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim().slice(0,80)).filter(Boolean));
  console.log('BUTTONS:', JSON.stringify(btns.slice(0,40)));
  await browser.close();
})();