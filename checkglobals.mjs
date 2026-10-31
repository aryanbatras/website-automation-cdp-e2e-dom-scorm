import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // list all function-valued globals
  const fns = Object.keys(window).filter(k => typeof window[k] === 'function');
  // list all object globals with keys
  const objs = Object.keys(window).filter(k => typeof window[k] === 'object' && window[k] !== null);
  return { functions: fns.slice(0,40), objects: objs.slice(0,40) };
});
console.log(JSON.stringify(info));
await browser.close();
