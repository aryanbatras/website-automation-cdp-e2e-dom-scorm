import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
for (const p of context.pages()) {
  if (p.url().includes('alm.ibm.com')) await p.close();
}
console.log('closed all alm pages');
await browser.close();
