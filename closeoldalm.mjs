import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
// close alm pages that are NOT the target course
const target = 'course:4058887';
for (const p of context.pages()) {
  if (p.url().includes('alm.ibm.com') && !p.url().includes(target)) {
    await p.close();
    console.log('closed', p.url().slice(0,60));
  }
}
await browser.close();
