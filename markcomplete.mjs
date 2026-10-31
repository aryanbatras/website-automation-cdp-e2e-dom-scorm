import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(1000);
const btn = page.locator('button:has-text("Mark complete"), a:has-text("Mark complete")').first();
console.log('visible:', await btn.isVisible().catch(()=>false));
await btn.click();
await page.waitForTimeout(3000);
const text = await page.evaluate(() => document.body.innerText);
console.log(text.includes('Completed') ? 'COMPLETED' : 'status unknown');
// return to plan
const ret = page.locator('a:has-text("Return to plan")').first();
if (await ret.isVisible().catch(()=>false)) { await ret.click(); await page.waitForTimeout(3000); }
console.log('URL:', page.url());
await browser.close();
