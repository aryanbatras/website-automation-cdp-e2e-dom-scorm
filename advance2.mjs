import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  const frame = page.frames().find(f => f.url().includes('scormcontent'));
  let prevTitle = '';
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1500);
    // expand
    await frame.evaluate(() => {
      document.querySelectorAll('[aria-expanded="false"], .blocks-accordion__header, .blocks-tabs__header-item, .flipcard__front, [role="tab"]:not([aria-selected="true"]), .blocks-reveal__header').forEach(el => { try { el.scrollIntoView({block:'center'}); el.click(); } catch(e){} });
    }).catch(()=>{});
    await page.waitForTimeout(400);
    // speed videos
    await frame.evaluate(() => {
      document.querySelectorAll('video').forEach(v => { try { v.muted=true; v.playbackRate=16; if (v.duration && isFinite(v.duration)) v.currentTime = Math.max(0, v.duration-0.5); v.play(); } catch(e){} });
    }).catch(()=>{});
    // scroll
    await frame.evaluate(() => {
      document.querySelectorAll('.page-wrap, [data-scroll], main, .lesson-content, body').forEach(el => { if (el && el.scrollTo) el.scrollTo({top: el.scrollHeight}); });
    }).catch(()=>{});
    await page.waitForTimeout(800);

    const title = await frame.evaluate(() => {
      const h = document.querySelector('h1,h2,.lesson-title,.slide-title,[class*="title"]');
      // find the main heading
      const candidates = Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean);
      return candidates[0] || '';
    });
    const text = await frame.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,260));
    const quizInputs = await frame.evaluate(() => document.querySelectorAll('input[type="radio"], input[type="checkbox"], [role="radiogroup"], [role="radio"]').length);
    const nextBtn = frame.locator('button.continue-btn, button:has-text("Next"), .continue-btn').first();
    const nextVisible = await nextBtn.isVisible().catch(()=>false);
    const nextEnabled = nextVisible ? await nextBtn.isEnabled().catch(()=>false) : false;
    const progress = await frame.evaluate(() => {
      const m = document.body.innerText.match(/(\d+)%\s*COMPLETE/);
      return m ? m[1]+'%' : '';
    });

    if (title !== prevTitle) {
      console.log(`\n[${progress}] ${title}`);
      prevTitle = title;
    }
    if (quizInputs > 0) {
      console.log('   >>> QUIZ DETECTED (inputs:', quizInputs, ')');
    }
    if (!nextEnabled) {
      console.log('   >>> Next DISABLED or not visible');
    }

    if (quizInputs > 0) break;

    if (nextVisible && nextEnabled) {
      await nextBtn.click();
    } else {
      console.log('   No enabled Next - stopping');
      break;
    }
    // detect completion
    if (/module completion|congratulations|100%\s*complete/i.test(text)) {
      console.log('   >>> COMPLETION DETECTED');
      break;
    }
  }
  await browser.close();
})();