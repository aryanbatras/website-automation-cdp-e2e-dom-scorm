import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(2000);
const text = await page.evaluate(() => document.body.innerText);
console.log(text.slice(4000, 12000));
await browser.close();
