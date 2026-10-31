import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Encryption');
  if (link) link.click();
});
await page.waitForTimeout(2000);
// click take again
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /take again/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll('input.quiz-fill__input'));
  return inputs.map((inp, i) => ({
    i, visible: inp.offsetParent !== null, editable: !inp.disabled && !inp.readOnly, value: inp.value
  }));
});
const cards = await frame.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  return cards.map((c,i) => ({ i, feedback: (c.querySelector('.quiz-card__feedback-label')?.innerText||'').trim() }));
});
console.log('inputs:', JSON.stringify(info));
console.log('cards:', JSON.stringify(cards));
await browser.close();
