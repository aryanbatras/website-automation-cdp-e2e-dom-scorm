import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(5000);
  const frame = page.frames()[3];
  const info = await frame.evaluate(() => {
    // Find elements with onclick or cursor:pointer style, and imgs
    const result = { imgs: [], clickable: [], allWithOnclick: [] };
    document.querySelectorAll('img').forEach(img => {
      result.imgs.push({ src: img.src.slice(-60), alt: img.alt, title: img.title, cls: String(img.className).slice(0,40) });
    });
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.cursor === 'pointer' && el.offsetWidth > 0 && el.offsetHeight > 0) {
        const t = (el.innerText||'').trim().slice(0,30);
        result.clickable.push({ tag: el.tagName, cls: String(el.className).slice(0,50), text: t, w: el.offsetWidth, h: el.offsetHeight });
      }
      if (el.getAttribute('onclick')) {
        result.allWithOnclick.push({ tag: el.tagName, onclick: el.getAttribute('onclick').slice(0,80) });
      }
    });
    return { imgs: result.imgs.slice(0,40), clickableCount: result.clickable.length, clickable: result.clickable.slice(0,60), onclickCount: result.allWithOnclick.length, onclick: result.allWithOnclick.slice(0,20) };
  });
  console.log('IMGS:', JSON.stringify(info.imgs, null, 2));
  console.log('CLICKABLE COUNT:', info.clickableCount);
  console.log('CLICKABLE:', JSON.stringify(info.clickable, null, 2));
  console.log('ONCLICK COUNT:', info.onclickCount);
  console.log('ONCLICK:', JSON.stringify(info.onclick, null, 2));
  await browser.close();
})();