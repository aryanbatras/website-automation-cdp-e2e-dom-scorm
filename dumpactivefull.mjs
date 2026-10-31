import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const html = await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    return card ? card.outerHTML : 'NO CARD';
  });
  console.log(html);
  await browser.close();
})();