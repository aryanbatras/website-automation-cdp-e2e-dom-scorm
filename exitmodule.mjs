import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click EXIT MODULE
await frame.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /exit module|exit course/i.test(b.innerText||''));
  if (btn) btn.click();
});
await page.waitForTimeout(3000);
console.log('URL after exit:', page.url());
await browser.close();
