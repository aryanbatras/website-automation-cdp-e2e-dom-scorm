import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
// find the indexAPI frame
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
console.log('indexFrame found:', !!indexFrame);
if (indexFrame) {
  const info = await indexFrame.evaluate(() => {
    const apis = ['API', 'API_1484_11'];
    const found = {};
    for (const a of apis) {
      found[a] = typeof window[a];
      // check functions
      if (window[a]) {
        found[a + '_funcs'] = Object.keys(window[a]).filter(k => typeof window[a][k] === 'function');
      }
    }
    return found;
  });
  console.log(JSON.stringify(info));
}
await browser.close();
