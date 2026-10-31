// usage: node solvequiz.mjs <optionIndex>
const idx = parseInt(process.argv[2] || '0');
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click option by index
await frame.evaluate((i) => {
  const opts = Array.from(document.querySelectorAll('[role="radio"]'));
  if (opts[i]) { opts[i].scrollIntoView({block:'center'}); opts[i].click(); }
}, idx);
await page.waitForTimeout(400);
// click submit
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
  if (btn) btn.click();
});
await page.waitForTimeout(1500);
// read feedback
const info = await frame.evaluate(() => {
  const feedback = document.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
  const feedbackText = (feedback?.innerText || '').trim();
  const feedbackBody = document.querySelector('.quiz-card__feedback-text, [class*="feedback-text"]');
  const body = (feedbackBody?.innerText || '').trim();
  const retake = Array.from(document.querySelectorAll("button")).find(b => /retake/i.test(b.innerText||"")) || null;
  const retakeVisible = !!retake && retake.offsetParent !== null;
  const submitBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
  const submitVisible = !!submitBtn && submitBtn.offsetParent !== null && !submitBtn.disabled;
  return { feedbackText, body: body.slice(0,800), retakeVisible, submitVisible };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
