import { chromium } from 'playwright';
const answer = process.argv[2];
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(1500);
  const storyFrame = page.frames().find(f => f.url().includes('story.html'));
  if (!storyFrame) { console.log('NO STORY FRAME'); await browser.close(); return; }
  // dispatch click on the span containing the answer
  const dispatched = await storyFrame.evaluate((ans) => {
    const spans = Array.from(document.querySelectorAll('span'));
    const target = spans.find(s => s.textContent.trim().toLowerCase().includes(ans.toLowerCase()));
    if (!target) return 'no span';
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    // also try parent
    if (target.parentElement) target.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return 'dispatched on ' + target.textContent.trim();
  }, answer);
  console.log('DISPATCH:', dispatched);
  await page.waitForTimeout(1000);
  // check if option got selected (label might change or a checkmark appears)
  const selected = await storyFrame.evaluate(() => {
    // look for any element with aria-checked or selected class
    const sel = document.querySelector('[aria-checked="true"], .selected, [class*="selected"]');
    return sel ? sel.textContent.trim().slice(0,60) : 'none selected';
  });
  console.log('SELECTED:', selected);
  await browser.close();
})();