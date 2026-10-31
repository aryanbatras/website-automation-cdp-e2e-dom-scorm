import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// select False (index 1)
await frame.evaluate(() => {
  const opts = Array.from(document.querySelectorAll('[role="radio"]'));
  if (opts[1]) { opts[1].scrollIntoView({block:'center'}); opts[1].click(); }
});
await page.waitForTimeout(800);
// verify selection
const sel = await frame.evaluate(() => Array.from(document.querySelectorAll('[role="radio"]')).map(o=>o.getAttribute('aria-checked')));
console.log('selection after click:', sel);
// submit
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const fb = document.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
  const feedbackText = (fb?.innerText||'').trim();
  const body = document.querySelector('.quiz-card__feedback-text, [class*="feedback-text"]');
  const bodyText = (body?.innerText||'').trim().slice(0,300);
  const opts = Array.from(document.querySelectorAll('[role="radio"]')).map(o=>({ariaChecked:o.getAttribute('aria-checked'), cls:o.className.slice(0,40)}));
  return { feedbackText, bodyText, opts };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
