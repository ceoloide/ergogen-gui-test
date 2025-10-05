import { test, expect } from '@playwright/test';
import Wubbo from '../src/examples/wubbo';

test.describe('Wubbo Configuration', () => {
  test('loads Wubbo configuration and displays demo.dxf', async ({ page }) => {
    // Navigate to the welcome page
    await page.goto('/new');

    // Wait for the welcome message to be visible
    await expect(page.getByText('Welcome to Ergogen Web UI')).toBeVisible();

    // Click on the Wubbo example to load the configuration
    await page.getByText(Wubbo.label).click();

    // Wait for navigation to the main page
    await expect(page).toHaveURL(/.*\/$/);

    // Wait for the editor to be visible
    await expect(page.getByTestId('config-editor')).toBeVisible({
      timeout: 30000,
    });

    // Wait for the downloads section to be visible
    const downloadsSection = page.getByTestId('downloads');
    await expect(downloadsSection).toBeVisible({ timeout: 30000 });

    // Wait for demo.dxf to appear in the downloads list
    const demoDxfRow = page.getByTestId('downloads-demo');
    await expect(demoDxfRow).toBeVisible({ timeout: 30000 });

    // Verify the download button is present
    const downloadButton = page.getByTestId('downloads-demo-download');
    await expect(downloadButton).toBeVisible();

    // Verify the preview button is present and clickable
    const previewButton = page.getByTestId('downloads-demo-preview');
    await expect(previewButton).toBeVisible();
  });
});
