// usage: node solvecards.mjs "Title" <card0_opt> <card1_opt> ...
const title = process.argv[2];
const opts = process.argv.slice(3).map(x => parseInt(x));
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

const numCards = await frame.evaluate(() => document.querySelectorAll('.quiz-card').length);
for (let ci = 0; ci < numCards; ci++) {
  const optIdx = opts[ci];
  // if locked, take again
  const locked = await frame.evaluate((i) => {
    const card = document.querySelectorAll('.quiz-card')[i];
    const o = card?.querySelector('[role="radio"]');
    return o ? o.getAttribute('aria-disabled') === 'true' : false;
  }, ci);
  if (locked) {
    await frame.evaluate(() => {
      // click take again for this card's retake button
      const btns = Array.from(document.querySelectorAll('button')).filter(b => /take again/i.test(b.innerText||''));
      // click the one within the card? just click first visible
      const btn = btns.find(b => b.offsetParent !== null);
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);
  }
  // select option
  await frame.evaluate(({ c, o }) => {
    const card = document.querySelectorAll('.quiz-card')[c];
    const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
    if (opts[o]) opts[o].click();
  }, { c: ci, o: optIdx });
  await page.waitForTimeout(800);
  // submit
  await frame.evaluate((c) => {
    const card = document.querySelectorAll('.quiz-card')[c];
    const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
    if (btn) btn.click();
  }, ci);
  await page.waitForTimeout(2000);
  const fb = await frame.evaluate((c) => {
    const card = document.querySelectorAll('.quiz-card')[c];
    return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  }, ci);
  console.log(`card ${ci} opt ${optIdx} -> ${fb}`);
}

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
