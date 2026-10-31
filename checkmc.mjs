import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com/activity/ALM-COURSE_4058887'));
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button, a')).map(e=>(e.innerText||'').trim()).filter(t=>/mark complete|complete|finish/i.test(t));
  return { btns: [...new Set(btns)], text: document.body.innerText.slice(0, 500) };
});
console.log(JSON.stringify(info));
await browser.close();
