import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('PLAN-EC6B83791960')) || context.pages()[0];
await page.waitForTimeout(3000);
const text = await page.evaluate(() => document.body.innerText);
console.log('has Data and Privacy:', text.includes('Data and Privacy'));
console.log('has System Security:', text.includes('System Security'));
console.log('has Threats:', text.includes('Threats'));
// print section after Get ready
const idx = text.indexOf('Get ready!');
console.log(text.slice(idx, idx+1500));
await browser.close();
