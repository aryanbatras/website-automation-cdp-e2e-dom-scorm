import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  await storyFrame.locator('button:has-text("Play")').first().click().catch(e => console.log('click err', e.message));
  await page.waitForTimeout(5000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,2000));
  console.log('TEXT:', text);
  const btns = await storyFrame.evaluate(() => Array.from(document.querySelectorAll('button,a,[role="button"]')).map(e => ({ text: (e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,60), cls: String(e.className).slice(0,50) })));
  console.log('BUTTONS:', JSON.stringify(btns, null, 2));
  await browser.close();
})();