import { chromium } from 'playwright';
const answer = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(1500);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  // Find label matching answer, get its left/top, click at that coordinate
  const pos = await storyFrame.evaluate((ans) => {
    const labels = Array.from(document.querySelectorAll('label'));
    const target = labels.find(l => l.innerText.trim().toLowerCase().includes(ans.toLowerCase()));
    if (!target) return null;
    const m = target.style.cssText.match(/left:\s*([\d.]+)px.*top:\s*([\d.]+)px/) || target.style.cssText.match(/top:\s*([\d.]+)px.*left:\s*([\d.]+)px/);
    // parse left and top
    const left = parseFloat(target.style.left);
    const top = parseFloat(target.style.top);
    return { left, top, text: target.innerText.trim() };
  }, answer);
  console.log('POS:', JSON.stringify(pos));
  if (pos) {
    await storyFrame.click('body', { position: { x: pos.left + 5, y: pos.top + 5 } }).catch(e => console.log('click err', e.message));
  }
  await page.waitForTimeout(800);
  // Submit
  await storyFrame.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Submit');
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,800));
  console.log('TEXT:', text);
  const btns = await storyFrame.evaluate(() => Array.from(document.querySelectorAll('button')).map(e => e.innerText.trim()).filter(Boolean));
  console.log('BUTTONS:', JSON.stringify(btns));
  await browser.close();
})();