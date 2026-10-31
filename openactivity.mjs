// usage: node openactivity.mjs <path>
import { chromium } from 'playwright';
const path = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(500);
// find link with matching path
const link = page.locator(`a[href*="${path}"]`).first();
console.log('visible:', await link.isVisible().catch(()=>false));
await link.click();
await page.waitForTimeout(5000);
console.log('URL:', page.url());
console.log('TITLE:', await page.title());
await browser.close();
