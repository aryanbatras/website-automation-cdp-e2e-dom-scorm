const planId = process.argv[2];
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.goto('https://skills.yourlearning.ibm.com/activity/' + planId);
await page.waitForTimeout(4000);
const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a')).filter(a => /URL-0E39749E2965|URL-CC7432BB7A8A/.test(a.getAttribute('href')||'')).map(a => ({href: a.getAttribute('href').split('?')[0], text: (a.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)}));
});
console.log(JSON.stringify(links));
await browser.close();
