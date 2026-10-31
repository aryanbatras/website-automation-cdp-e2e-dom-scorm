import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(2000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  // Get all TOC links
  const links = await frame.evaluate(() => Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).map(a => a.innerText.trim()));
  console.log('Total TOC items:', links.length);
  // Open sidebar
  await frame.evaluate(() => { const btn = document.querySelector('button.nav-control__button'); if (btn) btn.click(); });
  await page.waitForTimeout(1000);
  // Navigate through each slide in order
  for (let i = 0; i < links.length; i++) {
    const title = links[i];
    if (!title) continue;
    // navigate
    await frame.evaluate((t) => {
      const l = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).find(a => a.innerText.trim() === t);
      if (l) l.click();
    }, title);
    await page.waitForTimeout(2500);
    // expand accordions
    await frame.evaluate(() => {
      document.querySelectorAll('.blocks-accordion__header,[aria-expanded="false"]').forEach(h => { try { h.click(); } catch(e){} });
    });
    await page.waitForTimeout(500);
    // scroll
    await frame.evaluate(() => {
      document.querySelectorAll('.page-wrap, main, body').forEach(el => { if (el && el.scrollTo) try { el.scrollTo({top: el.scrollHeight}); } catch(e){} });
    });
    await page.waitForTimeout(1000);
    // click continue-btn if present
    const hasNext = await frame.evaluate(() => !!document.querySelector('button.continue-btn'));
    if (hasNext) {
      await frame.evaluate(() => { const b = document.querySelector('button.continue-btn'); if (b) b.click(); });
      await page.waitForTimeout(1500);
    }
    console.log(`[${i+1}/${links.length}] ${title}`);
  }
  // Final check
  await page.waitForTimeout(3000);
  const prog = await frame.evaluate(() => document.body.innerText.match(/(\d+)%\s*COMPLETE/)?.[0]);
  console.log('FINAL PROG:', prog);
  // check incomplete
  const inc = await frame.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link')).map(a => {
      const it = a.closest('.nav-sidebar__outline-section-item');
      return { text: a.innerText.trim(), complete: it?.classList.contains('nav-sidebar__outline-section-item--complete') };
    });
    return items.filter(x => x.text && !x.complete).map(x => x.text);
  });
  console.log('INCOMPLETE:', inc.length, inc);
  await browser.close();
})();