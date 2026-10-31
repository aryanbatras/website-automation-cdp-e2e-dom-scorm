import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages()[0];
  if (!page) page = await context.newPage();
  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  // Navigate to IBM SkillsBuild
  await page.goto('https://skillsbuild.org', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('nav err', e.message));
  await page.waitForTimeout(3000);
  console.log('After nav URL:', page.url());
  console.log('Title:', await page.title());
  // dump frames
  console.log('Frames:', page.frames().map(f => f.url()).join(' | '));
  await browser.close();
})();