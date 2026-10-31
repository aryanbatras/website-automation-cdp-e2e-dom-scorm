const url = process.argv[2];
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto(url);
await page.waitForTimeout(10000);
console.log('opened:', page.url());
await browser.close();
