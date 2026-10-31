import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(2000);
    const state = await frame.evaluate(() => {
      const card = document.querySelector('.quiz-card--active');
      const next = card?.querySelector('button.quiz-card__button--next');
      return { disabled: next?.disabled, ariaDisabled: next?.getAttribute('aria-disabled') };
    });
    console.log(`wait ${i*2}s:`, JSON.stringify(state));
    if (state.ariaDisabled === 'false' || state.disabled === false) {
      console.log('NEXT ENABLED!');
      break;
    }
  }
  await browser.close();
})();