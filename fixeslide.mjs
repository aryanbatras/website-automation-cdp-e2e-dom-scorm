// usage: node fixeslide.mjs "Title" <cardIndex> <optionIndex>
const title = process.argv[2];
const cardIdx = parseInt(process.argv[3]);
const optIdx = parseInt(process.argv[4]);
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate((t) => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === t);
  if (link) link.click();
}, title);
await page.waitForTimeout(2000);
// select option directly
await frame.evaluate(({ c, o }) => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  const card = cards[c];
  const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
  if (opts[o]) opts[o].click();
}, { c: cardIdx, o: optIdx });
await page.waitForTimeout(800);
await frame.evaluate((c) => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  const card = cards[c];
  const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  if (btn) btn.click();
}, cardIdx);
await page.waitForTimeout(2000);
const fb = await frame.evaluate((c) => {
  const cards = Array.from(document.querySelectorAll('.quiz-card'));
  const card = cards[c];
  return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
}, cardIdx);
console.log('feedback:', fb);
// solve remaining cards (card 1 already correct? check)
// click continue
await page.waitForTimeout(1000);
const cr = await frame.evaluate(() => {
  const b = document.querySelector('button.continue-btn, .continue-btn');
  if (b && b.offsetParent !== null) { b.click(); return 'clicked'; }
  return 'no continue';
});
console.log('continue:', cr);
await page.waitForTimeout(2000);
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
await browser.close();
