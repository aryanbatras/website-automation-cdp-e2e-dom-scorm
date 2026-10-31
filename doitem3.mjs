import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.goto('https://skills.yourlearning.ibm.com/activity/PLAN-EC6B83791960');
await page.waitForTimeout(4000);
// click the Credly link
await page.evaluate(() => {
  const a = Array.from(document.querySelectorAll('a')).find(x => (x.getAttribute('href')||'').includes('URL-0E39749E2965'));
  if (a) a.click();
});
await page.waitForTimeout(4000);
// click Mark complete
const mc = page.locator('button:has-text("Mark complete"), a:has-text("Mark complete")').first();
if (await mc.isVisible().catch(()=>false)) {
  await mc.click();
  await page.waitForTimeout(2000);
  // submit modal
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').trim()==='Submit' && (b.className||'').includes('primary'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
}
// return to plan
await page.evaluate(() => {
  const a = Array.from(document.querySelectorAll('a')).find(x => /Return to plan/i.test((x.innerText||'').trim()));
  if (a) a.click();
});
await page.waitForTimeout(3000);
console.log('done item3');
await browser.close();
