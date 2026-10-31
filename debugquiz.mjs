import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(500);
const frame = page.frames().find(f => f.url().includes('scormcontent'));
const quizInfo = await frame.evaluate(() => {
  const card = document.querySelector('.quiz-card, [class*="quiz-card"]');
  if (!card) return { error: 'no card' };
  const submitBtn = card.querySelector('button.quiz-card__button:not(.quiz-card__button--next)');
  const submitVisible = !!submitBtn && !submitBtn.disabled && submitBtn.offsetParent !== null;
  const feedback = card.querySelector('.quiz-card__feedback-label, [class*="feedback-label"]');
  const feedbackText = (feedback?.innerText || '').trim();
  const retake = card.querySelector('button.block-knowledge__retake');
  const retakeVisible = !!retake && retake.getAttribute('aria-hidden') !== 'true' && retake.offsetParent !== null;
  const alreadyCorrect = /correct/i.test(feedbackText) && !/incorrect/i.test(feedbackText);
  const titleEl = card.querySelector('.quiz-card__title, [id^="q-"]');
  const question = (titleEl?.innerText || '').trim().slice(0, 200);
  const options = Array.from(card.querySelectorAll('[role="radio"]')).map((el, idx) => {
    const labelId = el.getAttribute('aria-labelledby');
    const label = labelId ? document.getElementById(labelId) : null;
    const text = (label?.innerText || el.innerText || '').trim();
    return { index: idx, text: text.slice(0, 100), ariaChecked: el.getAttribute('aria-checked') };
  });
  return { hasCard: true, submitBtnFound: !!submitBtn, submitVisible, feedbackText, retakeVisible, alreadyCorrect, question, numOptions: options.length, options: options.slice(0,5) };
});
console.log(JSON.stringify(quizInfo, null, 2));
await browser.close();
