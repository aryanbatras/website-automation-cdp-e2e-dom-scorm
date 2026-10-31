import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  const frame = page.frames().find(f => f.url().includes('scormcontent'));
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(2000);
    // expand accordions
    await frame.evaluate(() => {
      document.querySelectorAll('[aria-expanded="false"], .blocks-accordion__header, .blocks-tabs__header-item, .flipcard__front, [role="tab"]:not([aria-selected="true"])').forEach(el => { el.scrollIntoView({block:'center'}); el.click(); });
    }).catch(()=>{});
    await page.waitForTimeout(500);
    // scroll
    await frame.evaluate(() => {
      document.querySelectorAll('.page-wrap, [data-scroll], main, .lesson-content, .cp-contents, body').forEach(el => { if (el) el.scrollTo?.({top: el.scrollHeight}); });
    }).catch(()=>{});
    await page.waitForTimeout(1000);
    const title = await frame.evaluate(() => {
      const h = document.querySelector('h1,h2,.lesson-title,.slide-title');
      return h ? h.innerText.trim().slice(0,80) : document.title;
    });
    const text = await frame.evaluate(() => document.body.innerText.slice(0,400).replace(/\s+/g,' '));
    console.log(`\n===== SLIDE ${i} =====`);
    console.log('TITLE-ish:', title);
    console.log('TEXT:', text.slice(0,300));
    // check quiz
    const quizCount = await frame.evaluate(() => document.querySelectorAll('input[type="radio"], input[type="checkbox"], [role="radiogroup"], .quiz, .knowledge-check').length);
    console.log('QUIZ INPUTS:', quizCount);
    if (quizCount > 0) { console.log('QUIZ DETECTED - stopping'); break; }
    // click Next
    const btn = frame.locator('button.continue-btn, button:has-text("Next"), .continue-btn').first();
    if (await btn.isVisible().catch(()=>false)) {
      await btn.click();
      console.log('Clicked Next');
    } else {
      console.log('No Next button visible');
      break;
    }
  }
  await browser.close();
})();