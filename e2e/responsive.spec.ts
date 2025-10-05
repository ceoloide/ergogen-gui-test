import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test('should show/hide panels correctly on mobile', async ({ page }) => {
    // Set viewport to a mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Empty Configuration' }).click();

    const configEditor = page.getByTestId('config-editor');
    const outputPanel = page.getByTestId('file-preview');

    // 1. On mobile, "Config" is active, editor is visible, output is hidden
    await expect(configEditor).toBeVisible();
    await expect(outputPanel).toBeHidden();

    // 2. Click "Outputs" button
    await page.getByRole('button', { name: 'Outputs' }).click();

    // 3. "Outputs" is active, editor is hidden, output is visible
    await expect(configEditor).toBeHidden();
    await expect(outputPanel).toBeVisible();
  });
});
