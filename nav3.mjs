import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.goto('https://sb-auth.skillsbuild.org/login?lang=en', { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a,button,input')).map(e => ({ tag:e.tagName, text: (e.innerText||e.value||e.placeholder||'').trim().slice(0,80), href: e.href })).filter(l=>l.text));
  console.log(JSON.stringify(links, null, 2));
  await browser.close();
})();