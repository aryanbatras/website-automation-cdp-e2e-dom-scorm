import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
const info = await indexFrame.evaluate(() => {
  const api = window.SCORM_objAPI;
  const methods = Object.keys(api).filter(k => typeof api[k] === 'function');
  const capi = api.capi_communicator;
  const capiMethods = capi ? Object.keys(capi).filter(k => typeof capi[k] === 'function') : [];
  const adapter = api.scorm_capi_adapter;
  const adapterMethods = adapter ? Object.keys(adapter).filter(k => typeof adapter[k] === 'function') : [];
  return { apiMethods: methods, capiMethods, adapterMethods };
});
console.log(JSON.stringify(info));
await browser.close();
