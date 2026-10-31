import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com'));
await page.waitForTimeout(4000);
const text = await page.evaluate(() => document.body.innerText);
const idx = text.indexOf('Data and Privacy');
console.log(text.slice(idx, idx+250));
await browser.close();
