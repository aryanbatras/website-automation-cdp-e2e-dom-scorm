import { chromium } from 'playwright';
const answer = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  // get iframe bounding box
  const iframeHandle = await storyFrame.frameElement();
  const box = await iframeHandle.boundingBox();
  console.log('IFRAME BOX:', JSON.stringify(box));
  // get label position
  const pos = await storyFrame.evaluate((ans) => {
    const labels = Array.from(document.querySelectorAll('label'));
    const target = labels.find(l => l.innerText.trim().toLowerCase().includes(ans.toLowerCase()));
    if (!target) return null;
    return { left: parseFloat(target.style.left), top: parseFloat(target.style.top), text: target.innerText.trim() };
  }, answer);
  console.log('POS:', JSON.stringify(pos));
  if (pos && box) {
    const x = box.x + pos.left + 5;
    const y = box.y + pos.top + 5;
    console.log('CLICKING AT:', x, y);
    await page.mouse.click(x, y);
  }
  await page.waitForTimeout(1000);
  // Submit
  await storyFrame.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Submit');
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,400));
  console.log('TEXT:', text);
  await browser.close();
})();