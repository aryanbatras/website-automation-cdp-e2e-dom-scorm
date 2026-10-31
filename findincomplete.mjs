import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const info = await frame.evaluate(() => {
  // find sidebar items without checkmark / with percentage < 100
  const items = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
  return items.map(a => {
    // find sibling status
    const li = a.closest('li') || a.parentElement;
    const status = li ? (li.innerText||'').match(/(\d+%|Completed|In progress)/) : null;
    return { text: a.innerText.trim(), status: status ? status[0] : '' };
  }).filter(x => x.status && !/completed/i.test(x.status));
});
console.log(JSON.stringify(info));
await browser.close();
