const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('file:///d:/CLAUDE_CLI/work/20250917_work/index.html');
  await page.waitForTimeout(2000);
  await page.click('.day:not(.other-month)');
  await page.waitForTimeout(1000);
  await page.fill('#dateMemoTitleInput', 'Test Memo');
  await page.fill('#dateMemoContentInput', 'Automated content');
  await page.click('#saveDateMemo');
  await page.waitForTimeout(1000);
  const memos = await page.evaluate(() => localStorage.getItem('calendarMemos'));
  console.log('Stored memos:', memos);
  await browser.close();
})();

