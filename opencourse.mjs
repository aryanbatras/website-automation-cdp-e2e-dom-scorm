import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  await page.goto('https://skills.yourlearning.ibm.com/activity/ALM-COURSE_4058891', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 5000));
  console.log('BODY:\n', txt);
  // frames
  console.log('FRAMES:', page.frames().map(f => f.url()));
  await browser.close();
})();