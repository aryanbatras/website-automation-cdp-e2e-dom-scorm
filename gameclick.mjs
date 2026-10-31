import { chromium } from 'playwright';
const label = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(1500);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  if (label) {
    await storyFrame.evaluate((lbl) => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === lbl);
      if (btn) btn.click();
    }, label);
  } else {
    // click first button with text
    await storyFrame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim().length > 0);
      if (btn) btn.click();
    });
  }
  await page.waitForTimeout(4000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,2500));
  console.log('TEXT:', text);
  const btns = await storyFrame.evaluate(() => Array.from(document.querySelectorAll('button,[role="button"]')).map(e => ({ text: (e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,80), cls: String(e.className).slice(0,40) })));
  console.log('BUTTONS:', JSON.stringify(btns.filter(b=>b.text), null, 2));
  await browser.close();
})();