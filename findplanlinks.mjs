import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(2000);
const links = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const text = (a.innerText||'').replace(/\s+/g,' ').trim();
    if (href.includes('/activity/PLAN') && /Generative AI|ICT Academy/i.test(text)) {
      out.push({ href: href.split('?')[0], text: text.slice(0,80) });
    }
  });
  return out;
});
console.log(JSON.stringify(links));
await browser.close();
