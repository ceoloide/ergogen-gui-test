import { test, expect } from '@playwright/test';

test('minimal test: page loads and has welcome text', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome to Ergogen Grafica')).toBeVisible();
});