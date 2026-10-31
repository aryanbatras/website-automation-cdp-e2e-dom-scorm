import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const apis = ['API', 'API_1484_11', 'pipwerks', 'SCORM'];
  const found = {};
  for (const a of apis) {
    // check in frame and parent
    try { found[a + '_frame'] = typeof window[a]; } catch(e) { found[a+'_frame'] = 'err'; }
  }
  // check parent
  try { found['parent_API'] = typeof window.parent?.API; } catch(e) { found['parent_API'] = 'err'; }
  try { found['top_API'] = typeof window.top?.API; } catch(e) { found['top_API'] = 'err'; }
  return found;
});
console.log(JSON.stringify(info));
await browser.close();
