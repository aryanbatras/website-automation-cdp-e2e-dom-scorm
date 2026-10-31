import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));

async function solveCard(cardIndex) {
  // Check if already correct
  const alreadyCorrect = await frame.evaluate((ci) => {
    const cards = Array.from(document.querySelectorAll('.quiz-card'));
    const card = cards[ci];
    if (!card) return false;
    const fb = (card.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    return /correct/i.test(fb) && !/incorrect/i.test(fb);
  }, cardIndex);
  if (alreadyCorrect) { console.log(`Card ${cardIndex}: already correct`); return; }

  // Get options count
  const numOpts = await frame.evaluate((ci) => {
    const cards = Array.from(document.querySelectorAll('.quiz-card'));
    const card = cards[ci];
    return card ? card.querySelectorAll('[role="radio"]').length : 0;
  }, cardIndex);
  console.log(`Card ${cardIndex}: ${numOpts} options`);

  for (let i = 0; i < numOpts; i++) {
    // Check if already correct
    const fbNow = await frame.evaluate((ci) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      const card = cards[ci];
      return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    }, cardIndex);
    if (/correct/i.test(fbNow) && !/incorrect/i.test(fbNow)) { console.log(`Card ${cardIndex}: solved`); return; }

    // Select option i in card cardIndex
    await frame.evaluate(({ ci, oi }) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      const card = cards[ci];
      const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
      if (opts[oi]) { opts[oi].scrollIntoView({block:'center'}); opts[oi].click(); }
    }, { ci: cardIndex, oi: i });
    await page.waitForTimeout(700);

    // Click submit in that card
    await frame.evaluate((ci) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      const card = cards[ci];
      const btn = card?.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
      if (btn) btn.click();
    }, cardIndex);
    await page.waitForTimeout(2000);

    const fb = await frame.evaluate((ci) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      const card = cards[ci];
      return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    }, cardIndex);
    console.log(`  Card ${cardIndex} option ${i} -> ${fb}`);
    if (/correct/i.test(fb) && !/incorrect/i.test(fb)) {
      console.log(`Card ${cardIndex}: SOLVED with option ${i}`);
      return;
    }
    // if incorrect, the body might reveal correct answer; but options are now locked (disabled).
    // Check if options are disabled (locked) -> break, can't retry on same card
    const locked = await frame.evaluate((ci) => {
      const cards = Array.from(document.querySelectorAll('.quiz-card'));
      const card = cards[ci];
      const o = card?.querySelector('[role="radio"]');
      return o ? o.getAttribute('aria-disabled') === 'true' : false;
    }, cardIndex);
    if (locked) {
      // parse correct answer from feedback body
      const body = await frame.evaluate((ci) => {
        const cards = Array.from(document.querySelectorAll('.quiz-card'));
        const card = cards[ci];
        return (card?.querySelector('.quiz-card__feedback-text')?.innerText || '').trim();
      }, cardIndex);
      console.log(`  Card ${cardIndex} locked. Feedback body: ${body.slice(0,200)}`);
      // try to find correct answer text and the option index (for next attempt we'd need to reload, but slide state persists)
      break;
    }
  }
}

const numCards = await frame.evaluate(() => document.querySelectorAll('.quiz-card').length);
console.log('Number of quiz cards:', numCards);
for (let i = 0; i < numCards; i++) {
  await solveCard(i);
}

// Check progress
const prog = await frame.evaluate(() => {
  const m = document.body.innerText.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/);
  return m ? m[0].replace(/\n/g,' ') : 'not found';
});
console.log('progress:', prog);
await browser.close();
