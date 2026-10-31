import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Cybersecurity threats
await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => (a.textContent||'').trim() === 'Cybersecurity threats');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const before = await frame.evaluate(() => document.querySelector('h1,h2,h3')?.innerText?.trim());
console.log('before:', before);
// click various elements to try to advance
const targets = ['.quiz-card', '.quiz-card__feedback', '.quiz-card__actions', '.quiz-card__actions--proceed', 'main', '.page__content'];
for (const sel of targets) {
  await frame.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.click();
  }, sel);
  await page.waitForTimeout(1000);
  const after = await frame.evaluate(() => document.querySelector('h1,h2,h3')?.innerText?.trim());
  if (after !== before) {
    console.log('ADVANCED after clicking', sel, '->', after);
    break;
  }
}
const after2 = await frame.evaluate(() => document.querySelector('h1,h2,h3')?.innerText?.trim());
console.log('final heading:', after2);
await browser.close();
