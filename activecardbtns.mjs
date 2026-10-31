import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    const btns = Array.from(card.querySelectorAll('button'));
    return btns.map(b => ({ cls: String(b.className), text: b.innerText.trim(), disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled'), offsetParent: !!b.offsetParent, style: b.getAttribute('style') }));
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();