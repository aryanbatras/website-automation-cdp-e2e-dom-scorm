import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(10000);
  const frames = page.frames();
  const frame2 = frames.find(f => f.url().includes('indexAPI.html'));
  console.log('frame found:', frame2 ? 'yes' : 'no');
  const result = await frame2.evaluate(() => {
    const api = window.SCORM2004_objAPI;
    console.log('api type:', typeof api);
    if (!api) return 'no api';
    try {
      const r1 = api.SetValue('cmi.completion_status', 'completed');
      const r2 = api.SetValue('cmi.success_status', 'passed');
      const commit = api.Commit('');
      // also try Finish
      return { r1, r2, commit, getCompletion: api.GetValue('cmi.completion_status') };
    } catch (e) {
      return { err: e.message, stack: e.stack?.slice(0,300) };
    }
  });
  console.log('RESULT:', JSON.stringify(result));
  await browser.close();
})();