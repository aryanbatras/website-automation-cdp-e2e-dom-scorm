import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(3000);
const text = await page.evaluate(() => document.body.innerText);
const m = text.match(/(\d+)%\s*\n?\s*(\d+) complete of (\d+) required/);
console.log('progress regex:', m);
// find "Learning Journey Overview" status
const idx = text.indexOf('Learning Journey Overview');
console.log(text.slice(idx, idx+200));
await browser.close();
