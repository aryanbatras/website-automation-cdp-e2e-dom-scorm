import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
// close ALM tab? find skillsbuild plan tab
const planPage = context.pages().find(p => p.url().includes('PLAN-EC6B83791960'));
if (planPage) { await planPage.bringToFront(); }
// reload plan to see updated progress
if (planPage) { await planPage.reload(); await planPage.waitForTimeout(4000); }
const text = await planPage.evaluate(() => document.body.innerText);
// find progress
const m = text.match(/(\d+)%/);
console.log('Progress snippet:', text.match(/(\d+)%\s*complete of (\d+) required/));
// print first 500
console.log(text.slice(0,600));
await browser.close();
