import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(1000);
const btn = page.locator('button:has-text("Go to activity"), a:has-text("Go to activity")').first();
await btn.click();
await page.waitForTimeout(8000);
// find alm page
const alm = context.pages().find(p => p.url().includes('alm.ibm.com'));
console.log('ALM URL:', alm?.url());
await browser.close();
