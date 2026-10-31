import { chromium } from 'playwright';
const idx = parseInt(process.argv[2] || '0');
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  await storyFrame.evaluate((i) => { try { GetPlayer().JumpToSlide(i); } catch(e) { console.log('err', e.message); } }, idx);
  await page.waitForTimeout(4000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,500));
  console.log('IDX:', idx, 'TEXT:', text);
  await browser.close();
})();