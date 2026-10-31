import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  // Click Log in
  await page.getByRole('button', { name: 'Log in' }).first().click().catch(e => console.log('click err', e.message));
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  await browser.close();
})();