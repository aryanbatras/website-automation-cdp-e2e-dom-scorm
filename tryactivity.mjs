import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // Expand accordion
  await frame.evaluate(() => {
    document.querySelectorAll('.blocks-accordion__header').forEach(h => h.click());
  });
  await page.waitForTimeout(500);
  // Find the input field and type
  await frame.evaluate(() => {
    const inp = document.querySelector('input[type="text"], textarea, [contenteditable="true"]');
    if (inp) {
      inp.focus();
      inp.value = 'Router firmware and smart device firmware keep devices secure by providing security updates and protecting against vulnerabilities.';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(2000);
  const btns = await frame.evaluate(() => Array.from(document.querySelectorAll('button')).map(x => ({ cls: String(x.className).slice(0,60), text: x.innerText.trim() })));
  console.log('BUTTONS:', JSON.stringify(btns));
  const hasContinue = await frame.evaluate(() => !!document.querySelector('.continue-btn, button.continue-btn'));
  console.log('HAS CONTINUE:', hasContinue);
  await browser.close();
})();