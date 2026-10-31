import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
// try search URL
await page.goto('https://skills.yourlearning.ibm.com/search?q=Getting+Started+with+Generative+AI');
await page.waitForTimeout(6000);
const text = await page.evaluate(() => document.body.innerText);
console.log(text.slice(0, 3000));
await browser.close();
