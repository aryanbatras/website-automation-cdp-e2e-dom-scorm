import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find any element with text "Next" or containing chevron-right icon
  const nextEls = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText||'').trim() === 'Next' || (e.getAttribute('aria-label')||'').toLowerCase().includes('next'));
  return nextEls.map(e => ({tag:e.tagName, cls:e.className.slice(0,60), visible: e.offsetParent!==null, rectW: e.getBoundingClientRect().width}));
});
console.log(JSON.stringify(info));
// find elements with chevron icon
const chevrons = await frame.evaluate(() => {
  return Array.from(document.querySelectorAll('i.icon-chevron-right, .icon-chevron-right')).map(e => ({tag:e.tagName, parent:e.parentElement?.className?.slice(0,60), visible: e.offsetParent!==null}));
});
console.log('chevrons:', JSON.stringify(chevrons));
await browser.close();
