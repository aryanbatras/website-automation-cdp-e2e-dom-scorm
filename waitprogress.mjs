import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(5000);
    const prog = await frame.evaluate(() => document.body.innerText.match(/(\d+)%\s*COMPLETE/)?.[0]);
    console.log(`wait ${i*5+5}s: ${prog}`);
  }
  await browser.close();
})();