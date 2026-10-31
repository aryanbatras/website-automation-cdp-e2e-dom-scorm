import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find all elements with text "Next" or "Continue"
  const els = Array.from(document.querySelectorAll('*')).filter(e => {
    const t = (e.innerText||'').trim();
    return t === 'Next' || t === 'Continue' || t === 'Next Lesson' || /next/i.test(e.getAttribute('aria-label')||'');
  });
  return els.map(e => ({tag:e.tagName, cls:e.className.slice(0,50), visible: e.offsetParent !== null, rectW: e.getBoundingClientRect().width}));
});
console.log(JSON.stringify(info));
await browser.close();
