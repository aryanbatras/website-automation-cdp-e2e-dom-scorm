import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(3000);
const text = await page.evaluate(() => document.body.innerText);
const m = text.match(/(\d+)%\s*\n?\s*(\d+) complete of (\d+) required/);
console.log('progress:', m ? m[0].replace(/\n/g,' ') : 'not found');
await browser.close();
