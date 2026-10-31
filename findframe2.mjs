import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
for (const f of page.frames()) {
  if (f.url().includes('scormcontent') || f.url().includes('scormdriver/indexAPI')) {
    console.log('FOUND:', f.url());
  }
}
// find frame with 'scormcontent' anywhere
const cf = page.frames().find(f => f.url().includes('scormcontent'));
console.log('scormcontent frame:', cf ? cf.url().slice(0,80) : 'NONE');
await browser.close();
