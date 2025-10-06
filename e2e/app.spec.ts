import { test, expect } from '@playwright/test';

test('renders editor and preview', async ({ page }) => {
  await page.goto('/new');
  await page.getByRole('button', { name: 'Empty Configuration' }).click();

  const editor = page.getByTestId('config-editor');
  await expect(editor).toBeVisible();

  const preview = page.getByTestId('demo.svg-file-preview');
  await expect(preview).toBeVisible();
});
