// usage: node processslide.mjs "Slide Title"
const title = process.argv.slice(2).join(' ');
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate
await frame.evaluate((t) => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === t);
  if (link) link.click();
}, title);
await page.waitForTimeout(2000);

// check quiz cards
const numCards = await frame.evaluate(() => document.querySelectorAll('.quiz-card').length);
const hasPractice = await frame.evaluate(() => !!document.querySelector('.quiz__wrap, .quiz-item__card'));
console.log(title, '| quiz-cards:', numCards, '| practice:', hasPractice);

// solve all quiz cards
if (numCards > 0) {
  for (let ci = 0; ci < numCards; ci++) {
    // check if already correct
    const already = await frame.evaluate((i) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      const card = cards[i];
      const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
      return /correct/i.test(fb) && !/incorrect/i.test(fb);
    }, ci);
    if (already) { console.log(`  card ${ci}: already correct`); continue; }
    const nOpts = await frame.evaluate((i) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      return cards[i]?.querySelectorAll('[role="radio"]').length || 0;
    }, ci);
    console.log(`  card ${ci}: ${nOpts} options`);
    let solved = false;
    for (let oi = 0; oi < nOpts; oi++) {
      const fbNow = await frame.evaluate((i) => {
        const cards = Array.from(document.querySelectorAll('.quiz-card'));
        const card = cards[i];
        return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
      }, ci);
      if (/correct/i.test(fbNow) && !/incorrect/i.test(fbNow)) { solved = true; break; }
      await frame.evaluate(({ c, o }) => {
        const cards = Array.from(document.querySelectorAll('.quiz-card'));
        const card = cards[c];
        const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
        if (opts[o]) opts[o].click();
      }, { c: ci, o: oi });
      await page.waitForTimeout(700);
      await frame.evaluate((c) => {
        const cards = Array.from(document.querySelectorAll('.quiz-card'));
        const card = cards[c];
        const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
        if (btn) btn.click();
      }, ci);
      await page.waitForTimeout(2000);
      const fb = await frame.evaluate((i) => {
        const cards = Array.from(document.querySelectorAll('.quiz-card'));
        const card = cards[i];
        return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
      }, ci);
      console.log(`    option ${oi} -> ${fb}`);
      if (/correct/i.test(fb) && !/incorrect/i.test(fb)) { solved = true; break; }
      // check locked
      const locked = await frame.evaluate((i) => {
        const cards = Array.from(document.querySelectorAll('.quiz-card'));
        const card = cards[i];
        const o = card?.querySelector('[role="radio"]');
        return o ? o.getAttribute('aria-disabled') === 'true' : false;
      }, ci);
      if (locked) {
        const body = await frame.evaluate((i) => {
          const cards = Array.from(document.querySelectorAll('.quiz-card'));
          const card = cards[i];
          return (card?.querySelector('.quiz-card__feedback-text')?.innerText || '').trim().slice(0,200);
        }, ci);
        console.log(`    locked. body: ${body}`);
        break;
      }
    }
    if (!solved) console.log(`  card ${ci}: NOT SOLVED`);
  }
}

// click continue/next
await page.waitForTimeout(1000);
const nextResult = await frame.evaluate(() => {
  const b = document.querySelector('button.continue-btn, .continue-btn');
  if (b && b.offsetParent !== null) { b.click(); return 'clicked continue'; }
  return 'no continue';
});
console.log('continue:', nextResult);
await page.waitForTimeout(2000);

const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
await browser.close();
