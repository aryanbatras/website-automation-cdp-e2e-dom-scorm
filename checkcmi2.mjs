import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
const info = await indexFrame.evaluate(() => {
  const api = window.SCORM_objAPI;
  const cmi = api.cmi;
  return { keys: Object.keys(cmi).slice(0,60), type: typeof cmi };
});
console.log(JSON.stringify(info));
await browser.close();
