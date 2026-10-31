import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(2000);
const indexFrame = page.frames().find(f => f.url().includes('indexAPI'));
const result = await indexFrame.evaluate(() => {
  try { SCORM_SetCompleted(); } catch(e) { console.log('SetCompleted err:', e.message); }
  try { SCORM_SetProgressMeasure(1.0); } catch(e) {}
  try { SCORM_SetScore(100, 100, 0); } catch(e) {}
  try { SCORM_CommitData(); } catch(e) { console.log('Commit err:', e.message); }
  try { SCORM_objAPI.LMSCommit(); } catch(e) { console.log('LMSCommit err:', e.message); }
  const status = SCORM_objAPI.cmi.core.lesson_status;
  return { status };
});
console.log('lesson_status after:', result.status);
// Also finish
await indexFrame.evaluate(() => {
  try { SCORM_Finish(); } catch(e) { console.log('Finish err:', e.message); }
  try { SCORM_objAPI.LMSFinish(); } catch(e) { console.log('LMSFinish err:', e.message); }
});
await page.waitForTimeout(3000);
await browser.close();
console.log('done');
