import { test, expect } from '@playwright/test';
import ADux from '../src/examples/adux';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/ConfigContext';

test.describe('Ergogen Configuration Processing', () => {
  test('loads A. dux configuration from local storage and displays outputs', async ({
    page,
  }) => {
    // Set A. dux config directly in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: ADux.value, key: CONFIG_LOCAL_STORAGE_KEY }
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
  });
  test('loads A. dux demo.dxf preview', async ({ page }) => {
    // Set A. dux config directly in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: ADux.value, key: CONFIG_LOCAL_STORAGE_KEY }
    );

    // Navigate to the main page
    await page.goto('/');

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
  });
  test('loads A. dux KiCad PCB', async ({ page }) => {
    // Set A. dux config directly in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: ADux.value, key: CONFIG_LOCAL_STORAGE_KEY }
    );

    // Navigate to the main page
    await page.goto('/');

    // Test KiCad PCB preview (architeuthis_dux.kicad_pcb output)
    const pcbRow = page.getByTestId(
      'downloads-container-architeuthis_dux-kicad_pcb'
    );
    await expect(pcbRow).toBeVisible({ timeout: 5000 });

    const pcbPreviewButton = page.getByTestId(
      'downloads-container-architeuthis_dux-kicad_pcb-preview'
    );
    await expect(pcbPreviewButton).toBeVisible();

    // Click to preview the KiCad PCB
    await pcbPreviewButton.click();
    const pcbFilePreview = page.getByTestId(
      'pcbs.architeuthis_dux-file-preview'
    );
    await expect(pcbFilePreview).toBeVisible({ timeout: 5000 });
  });
  test('loads A. dux JSCAD preview', async ({ page }) => {
    // Set A. dux config directly in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: ADux.value, key: CONFIG_LOCAL_STORAGE_KEY }
    );

    // Navigate to the main page
    await page.goto('/');

    // Test JSCAD preview (bottom output)
    const demoJscadRow = page.getByTestId(
      'downloads-container-prototype-jscad'
    );
    await expect(demoJscadRow).toBeVisible({ timeout: 5000 });

    const jscadPreviewButton = page.getByTestId(
      'downloads-container-prototype-jscad-preview'
    );
    await expect(jscadPreviewButton).toBeVisible();

    // Click to preview the JSCAD
    await jscadPreviewButton.click();
    const jscadFilePreview = page.getByTestId('cases.prototype-file-preview');
    await expect(jscadFilePreview).toBeVisible({ timeout: 5000 });
  });
  test('loads A. dux STL previews', async ({ page }) => {
    // Set A. dux config directly in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: ADux.value, key: CONFIG_LOCAL_STORAGE_KEY }
    );

    // Navigate to the main page
    await page.goto('/');

    // Wait for both STL files to appear (both mounting_plate and prototype)
    const stlRowMountingPlate = page.getByTestId(
      'downloads-container-mounting_plate-stl'
    );
    await expect(stlRowMountingPlate).toBeVisible({ timeout: 10000 });

    const stlRowPrototype = page.getByTestId(
      'downloads-container-prototype-stl'
    );
    await expect(stlRowPrototype).toBeVisible({ timeout: 10000 });

    // Wait for STL generation to complete (preview button should appear)
    const stlPreviewButtonPlate = page.getByTestId(
      'downloads-container-mounting_plate-stl-preview'
    );
    await expect(stlPreviewButtonPlate).toBeVisible({ timeout: 30000 });

    const stlPreviewButtonProto = page.getByTestId(
      'downloads-container-prototype-stl-preview'
    );
    await expect(stlPreviewButtonProto).toBeVisible({ timeout: 30000 });

    // Click to preview the mounting_plate STL
    await stlPreviewButtonPlate.click();
    const stlFilePreviewPlate = page.getByTestId(
      'cases.mounting_plate.stl-file-preview'
    );
    await expect(stlFilePreviewPlate).toBeVisible({ timeout: 5000 });

    // Click to preview the prototype STL
    await stlPreviewButtonProto.click();
    const stlFilePreviewProto = page.getByTestId(
      'cases.prototype.stl-file-preview'
    );
    await expect(stlFilePreviewProto).toBeVisible({ timeout: 5000 });
  });
});
