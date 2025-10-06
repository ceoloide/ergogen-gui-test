import { test, expect } from '@playwright/test';
import Wubbo from '../src/examples/wubbo';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/ConfigContext';

test.describe('Ergogen Configuration Processing', () => {
  test('loads Wubbo configuration from local storage and displays outputs', async ({
    page,
  }) => {
    // Set Wubbo config directly in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: Wubbo.value, key: CONFIG_LOCAL_STORAGE_KEY }
    );

    // Navigate to the main page
    await page.goto('/');

    // Wait for the page to load with the config
    await expect(page).toHaveURL(/.*\/$/);

    // Wait for the editor to be visible
    await expect(page.getByTestId('config-editor')).toBeVisible({
      timeout: 30000,
    });

    // Wait for the downloads section to be visible
    const downloadsSection = page.getByTestId('downloads');
    await expect(downloadsSection).toBeVisible({ timeout: 30000 });

    // Test DXF preview (demo output)
    const demoDxfRow = page.getByTestId('downloads-demo');
    await expect(demoDxfRow).toBeVisible({ timeout: 30000 });

    const dxfPreviewButton = page.getByTestId('downloads-demo-preview');
    await expect(dxfPreviewButton).toBeVisible();

    // Click to preview the DXF
    await dxfPreviewButton.click();
    const filePreview = page.getByTestId('file-preview');
    await expect(filePreview).toBeVisible({ timeout: 5000 });

    // Test JSCAD preview (switchplate case output)
    // First switchplate row should be the JSCAD version
    const switchplateJscadRows = page.getByTestId('downloads-switchplate');
    await expect(switchplateJscadRows.first()).toBeVisible({ timeout: 30000 });

    // Look for .jscad extension to identify the JSCAD row
    const jscadRow = page.locator('[data-testid="downloads-switchplate"]', {
      hasText: 'switchplate.jscad',
    });
    await expect(jscadRow).toBeVisible({ timeout: 30000 });

    const jscadPreviewButton = jscadRow.getByTestId(
      'downloads-switchplate-preview'
    );
    await expect(jscadPreviewButton).toBeVisible();

    // Click to preview the JSCAD
    await jscadPreviewButton.click();
    await expect(filePreview).toBeVisible({ timeout: 5000 });

    // Test STL preview (STL files are generated from JSCAD cases)
    // Look for the STL version of switchplate
    const stlRow = page.locator('[data-testid="downloads-switchplate"]', {
      hasText: 'switchplate.stl',
    });
    await expect(stlRow).toBeVisible({ timeout: 30000 });

    const stlPreviewButton = stlRow.getByTestId(
      'downloads-switchplate-preview'
    );
    await expect(stlPreviewButton).toBeVisible();

    // Click to preview the STL
    await stlPreviewButton.click();
    await expect(filePreview).toBeVisible({ timeout: 5000 });
  });
});
