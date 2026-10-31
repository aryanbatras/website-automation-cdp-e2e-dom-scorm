import { chromium } from 'playwright';
const answer = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  const dispatched = await storyFrame.evaluate((ans) => {
    const texts = Array.from(document.querySelectorAll('svg text'));
    const target = texts.find(t => t.textContent.trim().toLowerCase().includes(ans.toLowerCase().split(' ')[0]));
    if (!target) return 'no text';
    let el = target.parentElement;
    while (el && el.tagName === 'g') {
      const r = el.getBoundingClientRect();
      if (r.width > 300 && r.height > 20 && r.height < 60) break;
      el = el.parentElement;
    }
    if (!el) return 'no row';
    // dispatch click on the row g
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: el.getBoundingClientRect().x + 10, clientY: el.getBoundingClientRect().y + 10 }));
    // also try mousedown/mouseup
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    return 'dispatched on ' + el.id + ' ' + el.getAttribute('data-display-name');
  }, answer);
  console.log('DISPATCH:', dispatched);
  await page.waitForTimeout(1000);
  // Submit
  await storyFrame.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Submit');
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,300));
  console.log('TEXT:', text);
  await browser.close();
})();