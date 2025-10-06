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
      timeout: 10000,
    });

    // Wait for the downloads section to be visible
    const downloadsSection = page.getByTestId('downloads-container');
    await expect(downloadsSection).toBeVisible({ timeout: 5000 });

    // Test DXF preview (demo output)
    const demoDxfRow = page.getByTestId('downloads-container-demo-dxf');
    await expect(demoDxfRow).toBeVisible({ timeout: 5000 });

    const dxfPreviewButton = page.getByTestId(
      'downloads-container-demo-dxf-preview'
    );
    await expect(dxfPreviewButton).toBeVisible();

    // Click to preview the DXF
    await dxfPreviewButton.click();
    const dxfFilePreview = page.getByTestId('demo.svg-file-preview');
    await expect(dxfFilePreview).toBeVisible({ timeout: 5000 });

    // Test JSCAD preview (bottom output)
    const demoJscadRow = page.getByTestId('downloads-container-bottom-jscad');
    await expect(demoJscadRow).toBeVisible({ timeout: 5000 });

    const jscadPreviewButton = page.getByTestId(
      'downloads-container-bottom-jscad-preview'
    );
    await expect(jscadPreviewButton).toBeVisible();

    // Click to preview the JSCAD
    await jscadPreviewButton.click();
    const jscadFilePreview = page.getByTestId('cases.bottom-file-preview');
    await expect(jscadFilePreview).toBeVisible({ timeout: 5000 });

    // Test STL preview (bottom output)
    const demoStlRow = page.getByTestId('downloads-container-bottom-stl');
    await expect(demoStlRow).toBeVisible({ timeout: 5000 });

    const stlPreviewButton = page.getByTestId(
      'downloads-container-bottom-stl-preview'
    );
    await expect(stlPreviewButton).toBeVisible();

    // Click to preview the STL
    await stlPreviewButton.click();
    const stlFilePreview = page.getByTestId('cases.bottom.stl-file-preview');
    await expect(stlFilePreview).toBeVisible({ timeout: 5000 });
  });
});
