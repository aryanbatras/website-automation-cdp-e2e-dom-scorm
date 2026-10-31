import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.waitForTimeout(2000);
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim().slice(0,120), href: a.href })).filter(l => l.text && /system security|resume/i.test(l.text)));
  console.log(JSON.stringify(links, null, 2));
  // also find clickable cards
  const allLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim().slice(0,80), href: a.href })).filter(l=>/security/i.test(l.text)));
  console.log('SECURITY LINKS:', JSON.stringify(allLinks, null, 2));
  await browser.close();
})();