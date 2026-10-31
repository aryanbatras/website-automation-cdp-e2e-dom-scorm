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
const info = await frame.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll('input.quiz-fill__input'));
  return inputs.map((inp, i) => ({
    i, visible: inp.offsetParent !== null, editable: !inp.disabled && !inp.readOnly, value: inp.value, rectW: inp.getBoundingClientRect().width
  }));
});
console.log(JSON.stringify(info));
await browser.close();
