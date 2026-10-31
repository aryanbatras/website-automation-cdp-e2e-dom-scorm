import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button.quiz-card__button--next'));
    return btns.map((b,i) => ({ i, cls: String(b.className).slice(0,80), disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled'), offsetParent: !!b.offsetParent, text: b.innerText.trim() }));
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();