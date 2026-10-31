import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.quiz-card'));
    return cards.map((c,i) => ({
      i,
      active: c.classList.contains('quiz-card--active'),
      html: c.outerHTML.slice(0, 200).replace(/\s+/g,' ')
    }));
  });
  console.log(JSON.stringify(info, null, 2));
  // find NEXT inside active card
  const activeNext = await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active');
    if (!card) return 'no active card';
    const next = card.querySelector('button.quiz-card__button--next');
    if (!next) return 'no next in active';
    return { disabled: next.disabled, ariaDisabled: next.getAttribute('aria-disabled'), offsetParent: !!next.offsetParent, cls: next.className };
  });
  console.log('ACTIVE NEXT:', JSON.stringify(activeNext));
  await browser.close();
})();