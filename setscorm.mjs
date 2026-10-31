import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('alm.ibm.com'));
  await page.waitForTimeout(8000);
  const frame2 = page.frames().find(f => f.url().includes('indexAPI.html')) || page.frames()[2]; // scormdriver/indexAPI.html
  const result = await frame2.evaluate(() => {
    try {
      const api = window.SCORM2004_objAPI;
      if (!api) return 'no api object';
      const r1 = api.SetValue('cmi.completion_status', 'completed');
      const r2 = api.SetValue('cmi.success_status', 'passed');
      const r3 = api.SetValue('cmi.score.scaled', '1');
      const r4 = api.SetValue('cmi.score.raw', '100');
      const commit = api.Commit('');
      return { r1, r2, r3, r4, commit };
    } catch (e) {
      return { err: e.message };
    }
  });
  console.log('RESULT:', JSON.stringify(result));
  await browser.close();
})();