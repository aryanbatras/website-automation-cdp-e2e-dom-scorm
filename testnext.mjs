import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(1000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
// click accordion
await frame.locator('.blocks-accordion__header').first().click().catch(e=>console.log(e.message));
await page.waitForTimeout(500);
// scroll to bottom
await frame.evaluate(() => { document.querySelectorAll('.page-wrap,main,body').forEach(e=>e.scrollTo&&e.scrollTo(0,e.scrollHeight)); });
await page.waitForTimeout(500);
// click next
await frame.locator('button.continue-btn').first().click();
await page.waitForTimeout(3000);
const text = await frame.evaluate(() => document.body.innerText);
console.log(text.slice(0, 1500));
await browser.close();
