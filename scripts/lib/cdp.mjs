import { chromium } from 'playwright';

const CDP_ENDPOINT = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9222';

export async function connect() {
  const browser = await chromium.connectOverCDP(CDP_ENDPOINT);
  const context = browser.contexts()[0];
  return { browser, context };
}

export async function getCoursePage(context) {
  return context.pages().find(p => p.url().includes('alm.ibm.com')) || context.pages()[0];
}

export async function getContentFrame(page) {
  await page.waitForTimeout(2000);
  return page.frames().find(f => f.url().includes('scormcontent')) || page.frames()[3];
}

export async function getStoryFrame(page) {
  await page.waitForTimeout(2000);
  return page.frames().find(f => f.url().includes('story.html'));
}