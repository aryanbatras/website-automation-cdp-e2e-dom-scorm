import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const els = Array.from(document.querySelectorAll('button, a, [role="button"], input, [class*="next"], [class*="continue"]')).map(e => ({
    tag: e.tagName, text: (e.innerText||e.value||'').trim().slice(0,60), class: e.className.slice(0,100), disabled: e.disabled, ariaDisabled: e.getAttribute('aria-disabled')
  })).filter(e => e.text || e.class.includes('next') || e.class.includes('continue'));
  return els;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
