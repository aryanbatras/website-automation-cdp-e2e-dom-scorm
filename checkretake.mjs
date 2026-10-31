import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const retake = Array.from(document.querySelectorAll('button')).find(b => /take again|retake/i.test(b.innerText||''));
  return { retakeExists: !!retake, retakeVisible: !!retake && retake.offsetParent !== null, retakeText: retake?.innerText?.trim() };
});
console.log(JSON.stringify(info));
await browser.close();
