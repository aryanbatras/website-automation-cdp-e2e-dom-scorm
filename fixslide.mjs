import { chromium } from 'playwright';
const title = process.argv[2];
const answer = process.argv[3];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // navigate
  await frame.evaluate((t) => {
    const l = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === t);
    if (l) l.click();
  }, title);
  await page.waitForTimeout(3000);
  // expand accordions
  await frame.evaluate(() => {
    document.querySelectorAll('.blocks-accordion__header,[aria-expanded="false"]').forEach(h => { try { h.click(); } catch(e){} });
  });
  await page.waitForTimeout(1000);
  // If quiz has TAKE AGAIN, click it to reset, then re-answer
  const hasRetake = await frame.evaluate(() => {
    const btn = document.querySelector('button.block-knowledge__retake--active');
    if (btn) { btn.click(); return true; }
    // fallback: any retake button
    const btn2 = document.querySelector('button.block-knowledge__retake');
    if (btn2) { btn2.click(); return 'fallback'; }
    return false;
  });
  console.log('Retake clicked:', hasRetake);
  await page.waitForTimeout(2000);
  // Now re-select the answer and submit
  if (answer) {
    await frame.evaluate((ans) => {
      const card = document.querySelector('.quiz-card--active') || document.querySelector('.quiz-card');
      if (!card) return;
      const opts = Array.from(card.querySelectorAll('[role="radio"]'));
      const labels = opts.map(o => (o.parentElement?.querySelector('.quiz-multiple-choice-option__text')?.innerText || '').trim());
      const idx = labels.findIndex(t => t.toLowerCase().includes(ans.toLowerCase().split(' ')[0]));
      if (idx >= 0) opts[idx].click();
    }, answer);
    await page.waitForTimeout(800);
    await frame.evaluate(() => {
      const card = document.querySelector('.quiz-card--active') || document.querySelector('.quiz-card');
      const btn = card?.querySelector('.quiz-card__submit button, button.quiz-card__button:not(.quiz-card__button--next)');
      if (btn) btn.click();
    });
    await page.waitForTimeout(2000);
  }
  // Click hidden NEXT
  await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active') || document.querySelector('.quiz-card');
    if (card) {
      const nextDiv = card.querySelector('.quiz-card__next');
      const nextBtn = card.querySelector('button.quiz-card__button--next');
      if (nextDiv) { nextDiv.classList.remove('visually-hidden-always'); nextDiv.removeAttribute('aria-hidden'); }
      if (nextBtn) { nextBtn.classList.remove('visually-hidden-always'); nextBtn.removeAttribute('aria-hidden'); nextBtn.removeAttribute('tabindex'); nextBtn.click(); }
    }
  });
  await page.waitForTimeout(4000);
  // Check checkmark
  const item = await frame.evaluate((t) => {
    const l = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === t);
    const it = l?.closest('.nav-sidebar__outline-section-item');
    return it?.classList.contains('nav-sidebar__outline-section-item--complete');
  }, title);
  const prog = await frame.evaluate(() => document.body.innerText.match(/(\d+)%\s*COMPLETE/)?.[0]);
  console.log(title, 'complete?', item, 'prog:', prog);
  await browser.close();
})();