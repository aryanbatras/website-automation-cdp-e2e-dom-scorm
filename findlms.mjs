import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
const info = await indexFrame.evaluate(() => {
  const keys = Object.keys(window);
  const lmsKeys = keys.filter(k => /lms|scorm|setvalue|commit|finish/i.test(k));
  // also check for SCORM_objAPI methods via prototype
  const api = window.SCORM_objAPI;
  const allKeys = Object.getOwnPropertyNames(api);
  const protoKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(api));
  return { lmsKeys, apiAllKeys: allKeys, protoKeys };
});
console.log(JSON.stringify(info));
await browser.close();
