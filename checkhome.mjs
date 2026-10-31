import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.goto('https://skills.yourlearning.ibm.com/');
await page.waitForTimeout(6000);
const text = await page.evaluate(() => document.body.innerText);
// find plan progress lines
const lines = text.split('\n');
const planLines = [];
for (let i = 0; i < lines.length; i++) {
  if (/Learning Plan/.test(lines[i]) || /ICT Academy/.test(lines[i])) {
    planLines.push(lines[i].trim() + ' | ' + (lines[i+1]||'').trim() + ' | ' + (lines[i+2]||'').trim() + ' | ' + (lines[i+3]||'').trim());
  }
}
console.log(planLines.join('\n'));
await browser.close();
