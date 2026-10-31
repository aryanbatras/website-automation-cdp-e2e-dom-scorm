const actPath = process.argv[2];
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
// navigate to activity page
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.goto('https://skills.yourlearning.ibm.com' + actPath + '?planId=PLAN-EC6B83791960');
await page.waitForTimeout(4000);
// click Go to activity
const btn = page.locator('button:has-text("Go to activity"), a:has-text("Go to activity")').first();
await btn.click();
await page.waitForTimeout(9000);
// close any old alm pages except the newest
const almPages = context.pages().filter(p => p.url().includes('alm.ibm.com'));
// keep the last one
for (let i = 0; i < almPages.length - 1; i++) await almPages[i].close();
const newAlm = context.pages().find(p => p.url().includes('alm.ibm.com'));
console.log('ALM URL:', newAlm?.url());
await browser.close();
