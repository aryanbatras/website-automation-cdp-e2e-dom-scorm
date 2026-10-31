import { chromium } from 'playwright';
const answer = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(1500);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  // Use force click on text
  try {
    await storyFrame.getByText(answer, { exact: false }).first().click({ force: true, timeout: 5000 });
    console.log('force clicked text');
  } catch (e) {
    console.log('force click err:', e.message.slice(0,200));
  }
  await page.waitForTimeout(800);
  // Check if selected (look for any visual change - check if Submit still says invalid)
  await storyFrame.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Submit');
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  const text = await storyFrame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,400));
  console.log('TEXT:', text);
  await browser.close();
})();