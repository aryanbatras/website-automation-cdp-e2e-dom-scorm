import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// navigate to Module completion
await frame.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  const link = links.find(a => (a.textContent||'').trim() === 'Module completion');
  if (link) link.click();
});
await page.waitForTimeout(2000);
const info = await frame.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b=>({text:(b.innerText||'').trim(), cls:b.className.slice(0,40)}));
  const text = document.body.innerText.slice(0, 800);
  return { btns, text };
});
console.log('BUTTONS:', JSON.stringify(info.btns));
console.log('TEXT:', info.text.replace(/\s+/g,' ').slice(0,600));
await browser.close();
