import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com')) || context.pages()[0];
await page.waitForTimeout(1000);
const link = page.locator('a:has-text("Return to plan"), button:has-text("Return to plan")').first();
console.log('visible:', await link.isVisible().catch(()=>false));
await link.click().catch(e=>console.log('click err', e.message));
await page.waitForTimeout(5000);
// find plan page
const planPage = context.pages().find(p => p.url().includes('PLAN-EC6B83791960'));
console.log('plan url:', planPage?.url());
if (planPage) {
  await planPage.bringToFront();
  await planPage.reload();
  await planPage.waitForTimeout(4000);
  const text = await planPage.evaluate(() => document.body.innerText);
  const m = text.match(/(\d+)%\s*\n?\s*(\d+) complete of (\d+) required/);
  console.log('progress:', m);
  console.log(text.slice(0,400));
}
await browser.close();
