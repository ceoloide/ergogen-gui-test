import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ergogen/);
});

test('renders editor and preview', async ({ page }) => {
  await page.goto('/');

  const editor = page.getByTestId('config-editor');
  await expect(editor).toBeVisible();

  const preview = page.getByTestId('file-preview');
  await expect(preview).toBeVisible();
});
