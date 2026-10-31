import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
console.log('num pages:', context.pages().length);
for (const p of context.pages()) {
  console.log('  -', p.url().slice(0,130));
}
await browser.close();
