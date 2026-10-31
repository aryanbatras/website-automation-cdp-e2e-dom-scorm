import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
const text = await page.evaluate(() => document.body.innerText);
console.log('URL:', page.url());
console.log('has Congratulations:', /congratulations/i.test(text));
console.log('progress:', text.match(/Data and Privacy\s*(\d+)%\s*COMPLETE/)?.[0]);
// check if module completion registered
const skillsPage = context.pages().find(p => p.url().includes('skills.yourlearning'));
if (skillsPage) {
  await skillsPage.reload();
  await skillsPage.waitForTimeout(3000);
  const stext = await skillsPage.evaluate(() => document.body.innerText);
  const m = stext.match(/(\d+)%\s*\n?\s*(\d+) complete of (\d+) required/);
  console.log('PLAN PROGRESS:', m ? m[0].replace(/\n/g,' ') : 'not found');
}
await browser.close();
