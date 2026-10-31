import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
console.log('indexFrame found:', !!indexFrame);
if (indexFrame) {
  const info = await indexFrame.evaluate(() => {
    const keys = Object.keys(window);
    const fns = keys.filter(k => typeof window[k] === 'function');
    const objs = keys.filter(k => typeof window[k] === 'object' && window[k] !== null && k !== 'window' && k !== 'self' && k !== 'top' && k !== 'parent' && k !== 'frames' && k !== 'document');
    return { fns: fns.slice(0,40), objs: objs.slice(0,40), totalKeys: keys.length };
  });
  console.log(JSON.stringify(info));
}
await browser.close();
