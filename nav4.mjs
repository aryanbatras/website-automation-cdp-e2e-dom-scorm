import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.goto('https://skillsbuild.org', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button,a')).map(e=>e.innerText.trim()).filter(Boolean));
  console.log('login-ish:', btns.filter(b => /log in|sign out|profile|account|dashboard|my learning|log out/i.test(b)));
  await browser.close();
})();