import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(800);
const frame = page.frames().find(f => f.url().includes('scormcontent'));

async function getActiveCard() {
  return frame.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
    const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
    if (!active) return null;
    const card = active.querySelector('.quiz-card');
    if (!card) return null;
    const q = (card.querySelector('.quiz-card__title')?.innerText || '').trim();
    if (!q) return null; // no question (results screen)
    const opts = Array.from(card.querySelectorAll('[role="radio"]')).map((el,i) => {
      const labelId = el.getAttribute('aria-labelledby');
      const label = labelId ? document.getElementById(labelId) : null;
      return { index: i, text: (label?.innerText || el.innerText || '').trim(), ariaChecked: el.getAttribute('aria-checked'), disabled: el.getAttribute('aria-disabled') };
    });
    const fb = (card.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    return { question: q, options: opts, feedback: fb };
  });
}

async function selectOption(i) {
  await frame.evaluate((idx) => {
    const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
    const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
    const card = active?.querySelector('.quiz-card');
    const opts = Array.from(card?.querySelectorAll('[role="radio"]') || []);
    if (opts[idx]) { opts[idx].scrollIntoView({block:'center'}); opts[idx].click(); }
  }, i);
  await page.waitForTimeout(1200);
}

async function advance() {
  // click feedback area / card to advance
  await frame.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
    const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
    const fb = active?.querySelector('.quiz-card__feedback');
    if (fb) fb.click();
    else if (active) active.click();
  });
  await page.waitForTimeout(1500);
}

let safety = 0;
while (safety < 30) {
  safety++;
  const ac = await getActiveCard();
  if (!ac) {
    console.log('No active question card. Quiz likely complete.');
    break;
  }
  console.log('\nQ:', ac.question.slice(0,100));
  console.log('Feedback:', ac.feedback);
  console.log('Options:', ac.options.map(o=>o.text).join(' | '));

  // If already correct, advance
  if (/correct/i.test(ac.feedback) && !/incorrect/i.test(ac.feedback)) {
    console.log('Already correct, advancing...');
    await advance();
    continue;
  }

  // Try each option
  let solved = false;
  for (let i = 0; i < ac.options.length; i++) {
    await selectOption(i);
    const fb = await frame.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
      const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
      const card = active?.querySelector('.quiz-card');
      return (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
    });
    console.log(`  Option ${i} (${ac.options[i].text}) -> ${fb}`);
    if (/correct/i.test(fb) && !/incorrect/i.test(fb)) {
      solved = true;
      // advance
      await frame.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.quiz-item__card'));
        const active = cards.find(c => c.classList.contains('quiz-item__card--active'));
        const fb = active?.querySelector('.quiz-card__feedback');
        if (fb) fb.click();
        else if (active) active.click();
      });
      await page.waitForTimeout(1500);
      break;
    }
    // if incorrect, try next option (re-select). The radio may be disabled; selectOption handles clicking.
  }
  if (!solved) {
    console.log('Could not solve this question, advancing anyway');
    await advance();
  }
}

// Check results
const resultText = await frame.evaluate(() => document.body.innerText.slice(0, 500));
console.log('\n--- RESULT SNIPPET ---');
console.log(resultText.slice(0, 400));
await browser.close();
