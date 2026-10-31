import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
await page.waitForTimeout(3000);
// find frame with SCORM_objAPI
let scormFrame = null;
for (const f of page.frames()) {
  try {
    const has = await f.evaluate(() => typeof window.SCORM_objAPI !== 'undefined');
    if (has) { scormFrame = f; break; }
  } catch(e) {}
}
if (!scormFrame) { console.log('NO SCORM frame'); await browser.close(); process.exit(1); }
console.log('found scorm frame');
const result = await scormFrame.evaluate(() => {
  const api = window.SCORM_objAPI;
  try { SCORM_SetCompleted(); } catch(e) { }
  try { SCORM_SetProgressMeasure(1.0); } catch(e) { }
  try { SCORM_SetScore(100, 100, 0); } catch(e) { }
  try { SCORM_CommitData(); } catch(e) { }
  try { api.LMSCommit(); } catch(e) { }
  const status = api.cmi.core.lesson_status;
  return { status };
});
console.log('lesson_status:', result.status);
await scormFrame.evaluate(() => {
  try { SCORM_Finish(); } catch(e) { }
  try { window.SCORM_objAPI.LMSFinish(); } catch(e) { }
});
await page.waitForTimeout(3000);
await browser.close();
console.log('done');
