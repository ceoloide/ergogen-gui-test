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
  test('loads A. dux demo.dxf preview', async ({
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
  test('loads A. dux KiCad PCB', async ({
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
  test('loads A. dux JSCAD preview', async ({
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

    // Test JSCAD preview (bottom output)
    const demoJscadRow = page.getByTestId('downloads-container-prototype-jscad');
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
  test('loads A. dux STL preview', async ({
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

    // Test STL preview (bottom output)
    const stlRowPlate = page.getByTestId('downloads-container-mounting-plate-stl');
    await expect(stlRowPlate).toBeVisible({ timeout: 5000 });
    // const stlRowProto = page.getByTestId('downloads-container-prototype-stl');
    // await expect(stlRowProto).toBeVisible({ timeout: 5000 });

    const stlPreviewButton = page.getByTestId(
      'downloads-container-mounting-plate-stl-preview'
    );
    await expect(stlPreviewButton).toBeVisible();

    // Click to preview the STL
    await stlPreviewButton.click();
    const stlFilePreview = page.getByTestId('cases.mounting-plate.stl-file-preview');
    await expect(stlFilePreview).toBeVisible({ timeout: 5000 });
  });
});
