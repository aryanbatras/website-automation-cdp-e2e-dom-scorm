import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const active = Array.from(document.querySelectorAll('.quiz-card')).find(c => c.offsetParent !== null && c.getClientRects().length > 0);
  const submitBtn = active?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  const nextBtn = active?.querySelector('button.quiz-card__button--next');
  // check computed display
  const cs = submitBtn ? window.getComputedStyle(submitBtn) : null;
  return {
    submitDisplay: cs?.display,
    submitVisibility: cs?.visibility,
    submitRectW: submitBtn?.getBoundingClientRect().width,
    nextDisplay: nextBtn ? window.getComputedStyle(nextBtn).display : null,
    nextRectW: nextBtn?.getBoundingClientRect().width,
    // check if there's a 'check' or 'submit' overlay
    activeChildren: active ? Array.from(active.children).map(c=>c.className.slice(0,40)) : []
  };
});
console.log(JSON.stringify(info));
await browser.close();
