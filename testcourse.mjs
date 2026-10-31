import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  const url = 'https://skills.yourlearning.ibm.com/activity/ALM-COURSE_3825251';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  console.log('BODY TEXT:', txt);
  await browser.close();
})();