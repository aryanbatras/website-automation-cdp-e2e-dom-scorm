import { connect, getCoursePage, getContentFrame } from './lib/cdp.mjs';

const MAX_STEPS = 500;

async function main() {
  const { browser, context } = await connect();
  const page = await getCoursePage(context);
  const frame = await getContentFrame(page);

  let lastTitle = '';
  let stuckCount = 0;

  for (let step = 0; step < MAX_STEPS; step++) {
    // 0. Start module if on overview page
    await frame.evaluate(() => { const a = Array.from(document.querySelectorAll('a')).find(x => /START MODULE/i.test((x.innerText||'').trim())); if (a) a.click(); }).catch(() => {});
    await page.waitForTimeout(600);

    // 1. Close coach-mark bubbles that intercept clicks
    await frame.evaluate(() => {
      document.querySelectorAll('button.bubble__close, [aria-label="Close modal"]').forEach(b => { try { b.click(); } catch (e) {} });
    }).catch(() => {});

    // 2. Expand accordions, tabs, reveal blocks, flip cards
    await frame.evaluate(() => {
      const sels = ['[aria-expanded="false"]', '.blocks-accordion__header', '.blocks-tabs__header-item', '.flipcard__front', '[role="tab"]:not([aria-selected="true"])', '.blocks-reveal__header'];
      document.querySelectorAll(sels.join(',')).forEach(el => { try { el.scrollIntoView({ block: 'center' }); el.click(); } catch (e) {} });
      document.querySelectorAll('details').forEach(d => { d.open = true; });
    }).catch(() => {});

    // 3. Speed up & finish videos
    await frame.evaluate(() => {
      document.querySelectorAll('video').forEach(v => {
        try { v.muted = true; v.playbackRate = 16; if (v.duration && isFinite(v.duration)) v.currentTime = Math.max(0, v.duration - 0.3); v.play().catch(() => {}); } catch (e) {}
      });
    }).catch(() => {});

    // 4. Scroll all containers to bottom
    await frame.evaluate(() => {
      const nodes = [document.scrollingElement, document.body, ...document.querySelectorAll('.page-wrap, [data-scroll], main, .lesson-content, .fr-view')];
      nodes.forEach(el => { if (el && el.scrollTo) try { el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }); } catch (e) {} });
    }).catch(() => {});

    await page.waitForTimeout(350);

    const bodyText = await frame.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    const progress = await frame.evaluate(() => { const m = document.body.innerText.match(/(\d+)%\s*COMPLETE/); return m ? m[1] + '%' : ''; });

    // 5. Check completion
    if (progress === '100%') {
      console.log('COMPLETION_DETECTED');
      console.log(bodyText.slice(0, 500));
      await browser.close();
      process.exit(0);
    }

    // 5b. Check for practice quiz (multi-question quiz widget)
    const practiceQuiz = await frame.evaluate(() => !!document.querySelector('.quiz__wrap, .quiz-item__card'));
    if (practiceQuiz) {
      const quizDone = await frame.evaluate(() => /passed/i.test(document.body.innerText) && !!document.querySelector('.quiz-end, .quiz-results'));
      if (quizDone) {
        // quiz already passed; click continue to advance
        await frame.evaluate(() => { const b = document.querySelector('button.continue-btn, .continue-btn'); if (b) b.click(); }).catch(() => {});
        await page.waitForTimeout(1500);
        // loop continues
      } else {
        console.log('PRACTICE_QUIZ_DETECTED');
        const t = await frame.evaluate(() => { const h = Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.innerText.trim()).filter(Boolean); return h[0] || ''; });
        console.log('SLIDE_TITLE:', t);
        await browser.close();
        process.exit(44);
      }
    }

    // 6. Check for unsolved Captivate knowledge-check quiz
    const quizInfo = await frame.evaluate(() => {
      const card = document.querySelector('.quiz-card, [class*="quiz-card"]');
      if (!card) return null;
      const submitBtn = card.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
      const submitVisible = !!submitBtn && !submitBtn.disabled && submitBtn.offsetParent !== null;
      const feedback = card.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
      const feedbackText = (feedback?.innerText || '').trim();
      const retake = card.querySelector('button.block-knowledge__retake');
      const retakeVisible = !!retake && retake.getAttribute('aria-hidden') !== 'true' && retake.offsetParent !== null;
      const alreadyCorrect = /correct/i.test(feedbackText) && !/incorrect/i.test(feedbackText);
      if (!submitVisible || alreadyCorrect || retakeVisible) return { solved: true, feedbackText };
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
      const slideTitle = await frame.evaluate(() => { const h = Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.innerText.trim()).filter(Boolean); return h[0] || ''; });
      console.log('SLIDE_TITLE:', slideTitle);
      await browser.close();
      process.exit(42);
    }

    // 7. Determine slide title for progress
    const title = await frame.evaluate(() => {
      const c = Array.from(document.querySelectorAll('h1,h2,h3')).map(e => e.innerText.trim()).filter(Boolean);
      return c[0] || '';
    });
    if (title && title !== lastTitle) {
      console.log(`[${progress}] ${title}`);
      lastTitle = title;
    }

    // 8. Click Next (continue-btn) or fall back to TOC navigation
    let advanced = false;
    const nextBtn = frame.locator('button.continue-btn, button:has-text("Next"), .continue-btn').first();
    let nextVisible = await nextBtn.isVisible().catch(() => false);
    let nextEnabled = nextVisible ? await nextBtn.isEnabled().catch(() => false) : false;

    if (nextVisible && nextEnabled) {
      await frame.evaluate(() => { const b = document.querySelector('button.continue-btn, .continue-btn'); if (b) b.click(); }).catch(() => {});
      advanced = true; stuckCount = 0;
    } else {
      await page.waitForTimeout(800);
      nextVisible = await nextBtn.isVisible().catch(() => false);
      nextEnabled = nextVisible ? await nextBtn.isEnabled().catch(() => false) : false;
      if (nextVisible && nextEnabled) {
        await frame.evaluate(() => { const b = document.querySelector('button.continue-btn, .continue-btn'); if (b) b.click(); }).catch(() => {});
        advanced = true; stuckCount = 0;
      }
    }

    if (!advanced) {
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
        if (nextLink) { nextLink.click(); return { clicked: nextLink.innerText.trim() }; }
        return { clicked: null };
      }).catch(e => ({ error: e.message }));
      console.log('   TOC fallback:', JSON.stringify(tocResult));
      if (tocResult && tocResult.clicked) { advanced = true; stuckCount = 0; }
    }

    if (!advanced) {
      stuckCount++;
      console.log(`   Next not clickable (stuck ${stuckCount})`);
      if (stuckCount >= 5) { console.log('STUCK_EXIT'); await browser.close(); process.exit(43); }
    }
  }

  console.log('MAX_STEPS_REACHED');
  await browser.close();
  process.exit(43);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });