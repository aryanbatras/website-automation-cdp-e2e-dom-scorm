import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  const info = await frame.evaluate(() => {
    // all buttons including hidden
    const btns = Array.from(document.querySelectorAll('button, [role="button"], a.btn, a[class*="btn"]'));
    return btns.map(b => ({ tag: b.tagName, cls: String(b.className).slice(0,70), text: (b.innerText||'').trim().slice(0,40), aria: b.getAttribute('aria-label'), hidden: b.getAttribute('aria-hidden'), disabled: b.disabled || b.getAttribute('aria-disabled') }));
  });
  // filter to those with next/continue/arrow or empty (icon buttons)
  console.log('TOTAL BUTTONS:', info.length);
  console.log(JSON.stringify(info.filter(b => /next|continue|proceed|arrow|chevron|right/i.test(b.cls+b.text+b.aria) || b.text === ''), null, 2));
  await browser.close();
})();