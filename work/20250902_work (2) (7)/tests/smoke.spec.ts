import { test, expect } from '@playwright/test';

test('smoke: page boots', async ({ page }) => {
  await page.goto('about:blank');
  await page.setContent('<h1>OK</h1>');
  await expect(page.locator('h1')).toHaveText('OK');
});
