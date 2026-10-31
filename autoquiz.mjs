import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(800);
const frame = page.frames().find(f => f.url().includes('scormcontent'));

async function getOptions() {
  return frame.evaluate(() => Array.from(document.querySelectorAll('[role="radio"]')).map((el,i) => {
    const labelId = el.getAttribute('aria-labelledby');
    const label = labelId ? document.getElementById(labelId) : null;
    const text = (label?.innerText || el.innerText || '').trim();
    return { index: i, text, ariaChecked: el.getAttribute('aria-checked'), disabled: el.getAttribute('aria-disabled') };
  }));
}
async function ensureAnswerable() {
  const disabled = await frame.evaluate(() => {
    const o = document.querySelector('[role="radio"]');
    return o ? o.getAttribute('aria-disabled') === 'true' : false;
  });
  if (disabled) {
    await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);
  }
}
async function selectAndSubmit(i) {
  await ensureAnswerable();
  await frame.evaluate((idx) => {
    const opts = Array.from(document.querySelectorAll('[role="radio"]'));
    if (opts[idx]) { opts[idx].scrollIntoView({block:'center'}); opts[idx].click(); }
  }, i);
  await page.waitForTimeout(800);
  // verify
  const sel = await frame.evaluate(() => Array.from(document.querySelectorAll('[role="radio"]')).map(o=>o.getAttribute('aria-checked')));
  if (sel[i] !== 'true') {
    // retry click
    await frame.evaluate((idx) => {
      const opts = Array.from(document.querySelectorAll('[role="radio"]'));
      if (opts[idx]) opts[idx].click();
    }, i);
    await page.waitForTimeout(600);
  }
  await frame.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim().toUpperCase()==='SUBMIT');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
}
async function getFeedback() {
  return frame.evaluate(() => {
    const fb = document.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
    const feedbackText = (fb?.innerText||'').trim();
    const body = document.querySelector('.quiz-card__feedback-text, [class*="feedback-text"]');
    const bodyText = (body?.innerText||'').trim();
    return { feedbackText, bodyText };
  });
}

// already correct?
let fb = await getFeedback();
if (/correct/i.test(fb.feedbackText) && !/incorrect/i.test(fb.feedbackText)) {
  console.log('ALREADY_CORRECT');
  await browser.close(); process.exit(0);
}

const opts = await getOptions();
console.log('OPTIONS:', JSON.stringify(opts.map(o=>o.text)));

for (let i = 0; i < opts.length; i++) {
  await selectAndSubmit(i);
  fb = await getFeedback();
  console.log(`Attempt ${i} (${opts[i].text}) -> ${fb.feedbackText} | ${fb.bodyText.slice(0,150)}`);
  if (/correct/i.test(fb.feedbackText) && !/incorrect/i.test(fb.feedbackText)) {
    console.log('SOLVED with option', i, opts[i].text);
    await browser.close(); process.exit(0);
  }
  // parse correct answer if revealed
  const m = fb.bodyText.match(/Correct answer:\s*(.+?)\.\s*Your answer:/i) || fb.bodyText.match(/Correct answer:\s*(.+?)$/i);
  if (m) {
    const correctText = m[1].trim();
    console.log('CORRECT_ANSWER_TEXT:', correctText);
    const idx = opts.findIndex(o => o.text.trim().toLowerCase() === correctText.toLowerCase());
    if (idx >= 0 && idx !== i) {
      // ensure answerable (take again if disabled)
      await ensureAnswerable();
      await selectAndSubmit(idx);
      fb = await getFeedback();
      console.log('Retry correct option', idx, opts[idx].text, '->', fb.feedbackText);
      if (/correct/i.test(fb.feedbackText) && !/incorrect/i.test(fb.feedbackText)) {
        console.log('SOLVED');
        await browser.close(); process.exit(0);
      }
    }
    break; // answer revealed, no need to try more
  }
}

console.log('NOT_SOLVED');
await browser.close();
process.exit(1);
