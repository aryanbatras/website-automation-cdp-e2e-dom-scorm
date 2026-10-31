import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  await frame.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => /START QUIZ/i.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(4000);
  const text = await frame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0, 2500));
  console.log('TEXT:', text);
  const btns = await frame.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ({ cls: String(b.className).slice(0,60), text: b.innerText.trim().slice(0,40), disabled: b.disabled || b.getAttribute('aria-disabled') })));
  console.log('BUTTONS:', JSON.stringify(btns.filter(b=>b.text), null, 2));
  // quiz card
  const qhtml = await frame.evaluate(() => {
    const card = document.querySelector('.quiz-card--active, .quiz-card');
    return card ? card.outerHTML.slice(0, 4000) : 'NO CARD';
  });
  console.log('CARD:', qhtml.slice(0, 3000));
  await browser.close();
})();