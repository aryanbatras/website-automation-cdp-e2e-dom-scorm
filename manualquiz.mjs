import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// take again
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(1000);
// select Operational (index 1)
await frame.evaluate(() => {
  const opts = Array.from(document.querySelectorAll('[role="radio"]'));
  console.log('opts count', opts.length);
  if (opts[1]) { opts[1].scrollIntoView({block:'center'}); opts[1].click(); }
});
await page.waitForTimeout(1000);
const sel = await frame.evaluate(() => Array.from(document.querySelectorAll('[role="radio"]')).map(o=>o.getAttribute('aria-checked')));
console.log('selection:', sel);
// submit
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
  if (btn) btn.click();
});
await page.waitForTimeout(2500);
const info = await frame.evaluate(() => {
  const fb = document.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
  const body = document.querySelector('.quiz-card__feedback-text, [class*="feedback-text"]');
  const opts = Array.from(document.querySelectorAll('[role="radio"]')).map(o=>({ariaChecked:o.getAttribute('aria-checked'), cls:o.className.slice(0,50)}));
  return { feedbackLabel: (fb?.innerText||'').trim(), bodyText: (body?.innerText||'').trim(), opts };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
