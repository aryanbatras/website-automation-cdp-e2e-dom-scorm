import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  const frame = page.frames().find(f => f.url().includes('scormcontent'));
  await page.waitForTimeout(2000);
  // find bubble close buttons
  const bubbleInfo = await frame.evaluate(() => {
    const bubbles = Array.from(document.querySelectorAll('[class*="bubble__body"], [class*="bubble"]'));
    return bubbles.map(b => ({ cls: b.className, html: b.outerHTML.slice(0, 500) }));
  });
  console.log('BUBBLES:', JSON.stringify(bubbleInfo, null, 2));
  // find close buttons inside bubble
  const closeBtns = await frame.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
    return btns.filter(b => /close|dismiss|×|✕|skip/i.test((b.getAttribute('aria-label')||'')+(b.title||'')+(b.innerText||''))).map(b=>({cls:b.className, aria:b.getAttribute('aria-label'), text:b.innerText.trim().slice(0,20)}));
  });
  console.log('CLOSE BTNS:', JSON.stringify(closeBtns, null, 2));
  await browser.close();
})();