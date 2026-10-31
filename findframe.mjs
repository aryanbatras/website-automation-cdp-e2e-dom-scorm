import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
console.log('frames:');
for (const f of page.frames()) console.log('  -', f.url().slice(0,100));
await browser.close();
