import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Cybersecurity threats
await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Cybersecurity threats');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const html = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card');
  const actions = card?.querySelector('.quiz-card__actions');
  return actions ? actions.outerHTML : 'NO ACTIONS';
});
console.log(html);
await browser.close();
