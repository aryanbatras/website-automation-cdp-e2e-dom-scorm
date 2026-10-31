import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  for (let i = 0; i < page.frames().length; i++) {
    const f = page.frames()[i];
    try {
      const btns = await f.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean));
      const hasNext = btns.some(b => /next|continue|proceed/i.test(b));
      if (hasNext) console.log(`Frame ${i} has Next/Continue:`, btns.filter(b=>/next|continue|proceed/i.test(b)));
    } catch(e) {}
  }
  await browser.close();
})();