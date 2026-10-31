import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com/activity/ALM-COURSE_4058887'));
if (page) {
  await page.reload();
  await page.waitForTimeout(5000);
  const text = await page.evaluate(() => document.body.innerText);
  const idx = text.indexOf('Data and Privacy');
  console.log(text.slice(idx, idx+200));
}
await browser.close();
