import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  if (!page) { console.log('NO_COURSE_PAGE'); process.exit(10); }
  await page.waitForTimeout(3000);
  const frame = page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
  if (!frame) { console.log('NO_FRAME'); process.exit(10); }

  let lastTitle = '';
  let stuckCount = 0;

  for (let step = 0; step < 500; step++) {
    await page.waitForTimeout(1200);

    // 1. Close any coach-mark bubbles that intercept clicks
    await frame.evaluate(() => {
      document.querySelectorAll('button.bubble__close, [aria-label="Close modal"]').forEach(b => { try { b.click(); } catch(e){} });
    }).catch(()=>{});

    // 2. Expand accordions, tabs, reveal, flip cards
    await frame.evaluate(() => {
      const sels = ['[aria-expanded="false"]', '.blocks-accordion__header', '.blocks-tabs__header-item', '.flipcard__front', '[role="tab"]:not([aria-selected="true"])', '.blocks-reveal__header', 'details:not([open]) summary'];
      document.querySelectorAll(sels.join(',')).forEach(el => { try { el.scrollIntoView({block:'center'}); el.click(); } catch(e){} });
      // open all details
      document.querySelectorAll('details').forEach(d => d.open = true);
    }).catch(()=>{});

    // 3. Speed up & finish videos
    await frame.evaluate(() => {
      document.querySelectorAll('video').forEach(v => { try { v.muted=true; v.playbackRate=16; if (v.duration && isFinite(v.duration)) v.currentTime = Math.max(0, v.duration-0.3); v.play().catch(()=>{}); } catch(e){} });
    }).catch(()=>{});

    // 4. Scroll all containers to bottom
    await frame.evaluate(() => {
      const nodes = [document.scrollingElement, document.body, ...document.querySelectorAll('.page-wrap, [data-scroll], main, .lesson-content, .fr-view, .block, [class*="content"]')];
      nodes.forEach(el => { if (el && el.scrollTo) try { el.scrollTo({top: el.scrollHeight, behavior:'instant'}); } catch(e){} });
    }).catch(()=>{});

    await page.waitForTimeout(700);

    // 5. Check completion
    const bodyText = await frame.evaluate(() => document.body.innerText.replace(/\s+/g,' '));
    const progress = await frame.evaluate(() => { const m = document.body.innerText.match(/(\d+)%\s*COMPLETE/); return m ? m[1]+'%' : ''; });
    if (progress === '100%' || /congratulations|you have completed/i.test(bodyText)) {
      console.log('COMPLETION_DETECTED');
      console.log(bodyText.slice(0,500));
      process.exit(0);
    }

    // 6. Check quiz (Captivate knowledge check with role="radio" options)
    const quizInfo = await frame.evaluate(() => {
      const card = document.querySelector('.quiz-card, [class*="quiz-card"]');
      if (!card) return null;
      const submitBtn = card.querySelector('button.quiz-card__button, button[class*="submit"]');
      const submitVisible = !!submitBtn && !submitBtn.disabled && submitBtn.offsetParent !== null;
      // already answered correctly?
      const feedback = card.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
      const feedbackText = (feedback?.innerText || '').trim();
      const retake = card.querySelector('button.block-knowledge__retake');
      const retakeVisible = !!retake && retake.getAttribute('aria-hidden') !== 'true' && retake.offsetParent !== null;
      const alreadyCorrect = /correct/i.test(feedbackText) && !/incorrect/i.test(feedbackText);
      if (!submitVisible || alreadyCorrect || retakeVisible) {
        // already submitted or no active submit -> not an unsolved quiz
        return { solved: true, feedbackText, retakeVisible };
      }
      // extract question + options
      const titleEl = card.querySelector('.quiz-card__title, [id^="q-"]');
      const question = (titleEl?.innerText || '').trim().slice(0, 600);
      const options = Array.from(card.querySelectorAll('[role="radio"]')).map((el, idx) => {
        const labelId = el.getAttribute('aria-labelledby');
        const label = labelId ? document.getElementById(labelId) : null;
        const text = (label?.innerText || el.innerText || '').trim();
        return { index: idx, text: text.slice(0, 200), ariaChecked: el.getAttribute('aria-checked') };
      });
      return { solved: false, question, options, feedbackText };
    });

    if (quizInfo && quizInfo.solved === false && quizInfo.options && quizInfo.options.length > 0) {
      console.log('QUIZ_DETECTED');
      console.log(JSON.stringify(quizInfo, null, 2));
      console.log('SLIDE_TITLE:', await frame.evaluate(() => { const h=Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean); return h[0]||''; }));
      process.exit(42);
    }

    // 7. Determine slide title for progress
    const title = await frame.evaluate(() => {
      const c = Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.innerText.trim()).filter(Boolean);
      return c[0] || '';
    });
    if (title && title !== lastTitle) {
      console.log(`[${progress}] ${title}`);
      lastTitle = title;
    }

    // 8. Click Next (continue-btn) or fall back to TOC navigation
    let advanced = false;
    const nextBtn = frame.locator('button.continue-btn, button:has-text("Next"), .continue-btn').first();
    let nextVisible = await nextBtn.isVisible().catch(()=>false);
    let nextEnabled = nextVisible ? await nextBtn.isEnabled().catch(()=>false) : false;

    if (nextVisible && nextEnabled) {
      await frame.evaluate(() => {
        const b = document.querySelector('button.continue-btn, .continue-btn');
        if (b) b.click();
      }).catch(()=>{});
      advanced = true;
      stuckCount = 0;
    } else {
      // wait a bit and re-check (quiz feedback animation)
      await page.waitForTimeout(1500);
      nextVisible = await nextBtn.isVisible().catch(()=>false);
      nextEnabled = nextVisible ? await nextBtn.isEnabled().catch(()=>false) : false;
      if (nextVisible && nextEnabled) {
        await frame.evaluate(() => {
          const b = document.querySelector('button.continue-btn, .continue-btn');
          if (b) b.click();
        }).catch(()=>{});
        advanced = true;
        stuckCount = 0;
      }
    }

    if (!advanced) {
      // TOC fallback: click the next unlocked item after current (by URL hash)
      const tocResult = await frame.evaluate(() => {
        const currentHash = window.location.hash;
        const links = Array.from(document.querySelectorAll('a.nav-sidebar__outline-section-item__link'));
        const idx = links.findIndex(a => a.getAttribute('href') === currentHash);
        let nextLink = null;
        let start = idx >= 0 ? idx + 1 : 0;
        for (let i = start; i < links.length; i++) {
          const l = links[i];
          if (l.getAttribute('aria-disabled') === 'true') continue;
          if (l.getAttribute('href') === currentHash) continue;
          nextLink = l; break;
        }
        if (nextLink) { nextLink.click(); return { clicked: nextLink.innerText.trim(), fromHash: currentHash, nextHash: nextLink.getAttribute('href') }; }
        return { clicked: null, fromHash: currentHash, totalLinks: links.length, idx };
      }).catch(e => ({ error: e.message }));
      console.log('   TOC fallback:', JSON.stringify(tocResult));
      if (tocResult && tocResult.clicked) {
        advanced = true;
        stuckCount = 0;
      } else {
        stuckCount++;
        console.log(`   Next not clickable (stuck ${stuckCount})`);
        if (stuckCount >= 5) {
          console.log('STUCK_EXIT');
          process.exit(43);
        }
      }
    }
  }
  console.log('MAX_STEPS_REACHED');
  process.exit(43);
})();