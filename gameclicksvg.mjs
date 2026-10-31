import { chromium } from 'playwright';
const answer = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  const iframeHandle = await storyFrame.frameElement();
  const iframeBox = await iframeHandle.boundingBox();
  // find the svg text element matching answer, get its bbox
  const bbox = await storyFrame.evaluate((ans) => {
    const texts = Array.from(document.querySelectorAll('svg text'));
    const target = texts.find(t => t.textContent.trim().toLowerCase().includes(ans.toLowerCase().split(' ')[0]));
    if (!target) return null;
    const r = target.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2, text: target.textContent.trim() };
  }, answer);
  console.log('BBOX (iframe-relative):', JSON.stringify(bbox));
  if (bbox && iframeBox) {
    const x = iframeBox.x + bbox.x;
    const y = iframeBox.y + bbox.y;
    console.log('CLICKING AT (page):', x, y);
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