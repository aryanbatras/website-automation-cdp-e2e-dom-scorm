import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const text = await frame.evaluate(() => document.body.innerText);
const idx = text.indexOf('Encryption\n');
const chunk = text.slice(idx, idx+3000);
// find cipher key
const ki = chunk.toLowerCase().indexOf('cipher key');
console.log(chunk.slice(Math.max(0,ki-500), ki+1000));
await browser.close();
