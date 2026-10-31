import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const keys = Object.keys(window).filter(k => /cp|captivate|scorm/i.test(k));
  const cpObj = window.cp || window.Captivate || null;
  return { cpKeys: keys.slice(0,30), hasCp: !!cpObj, cpType: typeof cpObj };
});
console.log(JSON.stringify(info));
await browser.close();
