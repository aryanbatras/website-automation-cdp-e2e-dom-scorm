import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  return { exists: !!cb, visible: !!cb && cb.offsetParent !== null, rectW: cb?.getBoundingClientRect().width, disabled: cb?.disabled };
});
console.log(JSON.stringify(info));
// try clicking the restart-button TAKE AGAIN? no. Try clicking the page/quiz-end
const snippet = await frame.evaluate(() => {
  const end = document.querySelector('.quiz-end, .quiz-results');
  return end ? end.outerHTML.slice(0, 1000) : 'NO END';
});
console.log(snippet.slice(0, 500));
await browser.close();
