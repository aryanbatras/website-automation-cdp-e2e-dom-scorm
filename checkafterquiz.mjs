import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const cb = document.querySelector('button.continue-btn, .continue-btn');
  const card = document.querySelector('.quiz-card');
  const fb = (card?.querySelector('.quiz-card__feedback-label')?.innerText || '').trim();
  const nextBtn = card?.querySelector('button.quiz-card__button--next');
  return { continueVisible: !!cb && cb.offsetParent !== null, continueRectW: cb?.getBoundingClientRect().width, feedback: fb, nextVisible: !!nextBtn && nextBtn.offsetParent !== null, nextRectW: nextBtn?.getBoundingClientRect().width };
});
console.log(JSON.stringify(info));
// check sidebar complete for Cybersecurity threats
const complete = await frame.evaluate(() => {
  const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === 'Cybersecurity threats');
  const div = link?.closest('li')?.querySelector('div.nav-sidebar__outline-section-item');
  return div ? div.className.includes('complete') : null;
});
console.log('Cybersecurity threats complete:', complete);
await browser.close();
