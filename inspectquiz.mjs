import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('alm.ibm.com'));
  if (!page) { console.log('NOPAGE'); await browser.close(); return; }
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  if (!frame) { console.log('NOFRAME'); await browser.close(); return; }
  const html = await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card, [class*="quiz-card"], [class*="knowledge"]');
    return card ? card.outerHTML.slice(0, 8000) : 'NO CARD FOUND';
  });
  console.log('QUIZ CARD HTML:\n', html);
  await browser.close();
})();