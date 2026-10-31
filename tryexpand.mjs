import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // Expand all accordions
  await frame.evaluate(() => {
    document.querySelectorAll('.blocks-accordion__header, [aria-expanded="false"]').forEach(h => { try { h.click(); } catch(e){} });
  });
  await page.waitForTimeout(1000);
  // Scroll
  await frame.evaluate(() => {
    document.querySelectorAll('.page-wrap, main, body').forEach(el => { if (el && el.scrollTo) el.scrollTo({top: el.scrollHeight}); });
  });
  await page.waitForTimeout(3000);
  const btns = await frame.evaluate(() => Array.from(document.querySelectorAll('button')).map(x => ({ cls: String(x.className).slice(0,60), text: x.innerText.trim() })));
  console.log('BUTTONS:', JSON.stringify(btns));
  const hasContinue = await frame.evaluate(() => !!document.querySelector('.continue-btn'));
  console.log('HAS CONTINUE:', hasContinue);
  await browser.close();
})();