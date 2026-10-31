import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click TAKE AGAIN
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(600);
// select False (index 1)
await frame.evaluate(() => {
  const opts = Array.from(document.querySelectorAll('[role="radio"]'));
  if (opts[1]) opts[1].click();
});
await page.waitForTimeout(400);
// submit
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
  if (btn) btn.click();
});
await page.waitForTimeout(1500);
const info = await frame.evaluate(() => {
  const fb = document.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
  const feedbackText = (fb?.innerText||'').trim();
  const body = document.querySelector('.quiz-card__feedback-text, [class*="feedback-text"]');
  const bodyText = (body?.innerText||'').trim().slice(0,300);
  const nextBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim()==='Next');
  return { feedbackText, bodyText, nextVisible: !!nextBtn && nextBtn.offsetParent!==null, nextDisabled: nextBtn?.disabled };
});
console.log(JSON.stringify(info));
await browser.close();
