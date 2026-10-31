import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(1000);
const modals = await page.evaluate(() => {
  const out=[];
  document.querySelectorAll('.Modal_container__SoTFm, [role="dialog"], .modal').forEach(m => {
    out.push((m.innerText||'').slice(0,500));
  });
  return out;
});
console.log('MODALS:', JSON.stringify(modals));
// list buttons
const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b=>({text:(b.innerText||'').trim(), class:b.className.slice(0,60)})).filter(b=>b.text));
console.log('BUTTONS:', JSON.stringify(btns));
await browser.close();
