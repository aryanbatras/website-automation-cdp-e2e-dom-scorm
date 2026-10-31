import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
console.log('URL:', page.url());
console.log('TITLE:', await page.title());
console.log('FRAMES:');
for (const f of page.frames()) {
  console.log('  -', f.url().slice(0,150));
}
await browser.close();
