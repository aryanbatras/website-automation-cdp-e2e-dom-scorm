import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  const hasQuizCard = !!document.querySelector('.quiz-card, [class*="quiz-card"]');
  const radios = document.querySelectorAll('[role="radio"]').length;
  const bodyText = document.body.innerText.slice(0, 1500);
  return { hasQuizCard, radios, bodyText };
});
console.log('hasQuizCard:', info.hasQuizCard);
console.log('radios:', info.radios);
console.log(info.bodyText);
await browser.close();
