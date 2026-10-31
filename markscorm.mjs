import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(3000);
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
if (!indexFrame) { console.log('NO indexAPI frame'); await browser.close(); process.exit(1); }
const result = await indexFrame.evaluate(() => {
  try { SCORM_SetCompleted(); } catch(e) { }
  try { SCORM_SetProgressMeasure(1.0); } catch(e) { }
  try { SCORM_SetScore(100, 100, 0); } catch(e) { }
  try { SCORM_CommitData(); } catch(e) { }
  try { SCORM_objAPI.LMSCommit(); } catch(e) { }
  const status = SCORM_objAPI.cmi.core.lesson_status;
  return { status };
});
console.log('lesson_status:', result.status);
await indexFrame.evaluate(() => {
  try { SCORM_Finish(); } catch(e) { }
  try { SCORM_objAPI.LMSFinish(); } catch(e) { }
});
await page.waitForTimeout(3000);
await browser.close();
console.log('done');
