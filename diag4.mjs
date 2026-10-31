import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('skills.yourlearning.ibm.com')) || context.pages()[0];
await page.waitForTimeout(2000);
// find all links/buttons with text containing module names
const links = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('a, button').forEach(el => {
    const t = (el.innerText||'').trim();
    if (t && (t.includes('Learning Journey') || t.includes('Glossary') || t.includes('Credly') || t.includes('Earn it'))) {
      out.push({ tag: el.tagName, text: t.slice(0,80), href: el.getAttribute('href'), onclick: !!el.onclick });
    }
  });
  return out;
});
console.log(JSON.stringify(links, null, 2));
await browser.close();
