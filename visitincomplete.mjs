import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
console.log('frame found:', !!frame);

const targets = ['Cybersecurity threats', 'Why data privacy matters', 'Privacy best practices', 'Encryption', 'Show what you know!'];
for (const t of targets) {
  console.log('--- Visiting:', t);
  await frame.evaluate((title) => {
    const link = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === title);
    if (link) link.click();
  }, t);
  await page.waitForTimeout(2000);
  await frame.evaluate(() => {
    document.querySelectorAll('[aria-expanded="false"]').forEach(e => { try { e.click(); } catch(err){} });
    document.querySelectorAll('details').forEach(d => { d.open = true; });
    const s = document.scrollingElement || document.body;
    if (s.scrollTo) s.scrollTo(0, s.scrollHeight);
  });
  await page.waitForTimeout(1000);
  const clicked = await frame.evaluate(() => {
    const b = document.querySelector('button.continue-btn, .continue-btn');
    if (b && !b.disabled && b.offsetParent !== null) { b.click(); return true; }
    return false;
  });
  console.log('   continue clicked:', clicked);
  await page.waitForTimeout(1500);
}

const remaining = await frame.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li.nav-sidebar__outline-list-item'));
  return items.map(li => {
    const a = li.querySelector('a.nav-sidebar__outline-section-item__link');
    const div = li.querySelector('div.nav-sidebar__outline-section-item');
    const complete = div && div.className.includes('complete');
    return { text: a ? a.innerText.trim() : '', complete: !!complete };
  }).filter(x => !x.complete);
});
console.log('Remaining incomplete:', JSON.stringify(remaining));
await browser.close();
