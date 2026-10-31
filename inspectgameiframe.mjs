import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Show what you know!');
  if (link) link.click();
});
await page.waitForTimeout(3000);
// find the game iframe
const iframes = page.frames().filter(f => f.url().includes('cpcontents') && !f.url().includes('scorm'));
console.log('num iframes:', iframes.length);
for (const f of iframes) {
  console.log('iframe url:', f.url().slice(0,120));
  try {
    const text = await f.evaluate(() => document.body.innerText.slice(0, 500));
    console.log('iframe text:', text.slice(0, 300));
  } catch(e) { console.log('err:', e.message); }
}
await browser.close();
