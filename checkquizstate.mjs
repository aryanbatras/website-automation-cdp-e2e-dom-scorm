import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const state = await frame.evaluate(() => {
  const opts = Array.from(document.querySelectorAll('[role="radio"]')).map((el,i) => ({
    index: i, ariaChecked: el.getAttribute('aria-checked'), ariaDisabled: el.getAttribute('aria-disabled'), class: el.className.slice(0,60)
  }));
  const feedbackFrame = document.querySelector('.quiz-card__feedback, [class*="feedback--frame"]');
  const feedbackHidden = feedbackFrame?.getAttribute('aria-hidden');
  const submitBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
  return { opts, feedbackHidden, submitDisabled: submitBtn?.disabled, submitVisible: !!submitBtn && submitBtn.offsetParent!==null };
});
console.log(JSON.stringify(state, null, 2));
await browser.close();
