import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.goto('https://skills.yourlearning.ibm.com/');
await page.waitForTimeout(6000);
const text = await page.evaluate(() => document.body.innerText);
console.log('LEN:', text.length);
// print lines with progress
const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
for (const l of lines) {
  if (/complete|In progress|Completed/i.test(l)) console.log('>>', l);
}
await browser.close();
