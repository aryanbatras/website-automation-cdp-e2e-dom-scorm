import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /exit module/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const modals = Array.from(document.querySelectorAll('[role="dialog"], [class*="modal"]')).map(m => (m.innerText||'').slice(0,300));
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b=>(b.innerText||'').trim()).filter(Boolean);
  return { modals, btns };
});
console.log(JSON.stringify(info));
await browser.close();
