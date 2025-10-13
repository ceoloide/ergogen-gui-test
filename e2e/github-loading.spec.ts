import { test, expect } from '@playwright/test';
import { makeShooter } from './utils/screenshots';

test.describe('GitHub Loading', () => {
  test('should load config and footprints from ceoloide/mr_useful', async ({
    page,
  }) => {
    const shoot = makeShooter(page, test.info());

    // Listen for console logs to verify our instrumentation
    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.startsWith('[GitHub]')) {
        logs.push(text);
        console.log(text); // Also output to test log
      }
    });

    // Navigate to the welcome page
    await page.goto('/new');
    await shoot('before-github-input');

    // Find the GitHub input and load button
    const githubInput = page.getByTestId('github-input');
    const loadButton = page.getByTestId('github-load-button');

    // Enter the repository URL
    await githubInput.fill('ceoloide/mr_useful');
    await shoot('after-github-input-filled');

    // Click the load button
    await loadButton.click();
    await shoot('after-load-button-clicked');

    // Wait for the config to be loaded (should navigate to home)
    await expect(page).toHaveURL(/.*\/$/, { timeout: 30000 });
    await shoot('after-navigation-to-home');

    // Verify config editor is visible
    await expect(page.getByTestId('config-editor')).toBeVisible({
      timeout: 10000,
    });
    await shoot('config-editor-visible');

    // Verify that console logs show GitHub loading activity
    await page.waitForTimeout(2000); // Give time for all logs to appear

    // Check that we have GitHub logging
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((log) => log.includes('Starting fetch'))).toBe(true);

    // Check for submodule loading
    expect(
      logs.some(
        (log) => log.includes('.gitmodules') || log.includes('submodule')
      )
    ).toBe(true);

    // Check for footprint loading
    expect(logs.some((log) => log.includes('Loaded footprint'))).toBe(true);

    // Open settings to check footprints
    const settingsButton = page.getByTestId('settings-toggle-button');
    await settingsButton.click();
    await shoot('settings-opened');

    // Wait for the injections/footprints section to be visible
    await expect(page.getByTestId('injections-container')).toBeVisible({
      timeout: 5000,
    });
    await shoot('injections-visible');

    // Verify that footprints were loaded
    // The mr_useful repo should have footprints from the submodule
    const footprintRows = page.locator(
      '[data-testid^="injections-container-"]'
    );
    const count = await footprintRows.count();

    console.log(`Found ${count} footprint(s)`);
    expect(count).toBeGreaterThan(0);
    await shoot('footprints-loaded');

    // Output all logs at the end for debugging
    console.log('\n=== All GitHub Logs ===');
    logs.forEach((log) => console.log(log));
    console.log('=== End GitHub Logs ===\n');
  });

  test('should load config with URL parameter and footprints', async ({
    page,
  }) => {
    const shoot = makeShooter(page, test.info());

    // Listen for console logs
    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.startsWith('[GitHub]')) {
        logs.push(text);
        console.log(text);
      }
    });

    // Navigate directly with the github URL parameter
    await page.goto('/?github=ceoloide/mr_useful');
    await shoot('loaded-with-url-param');

    // Wait for config to be loaded and editor to be visible
    await expect(page.getByTestId('config-editor')).toBeVisible({
      timeout: 30000,
    });
    await shoot('config-editor-visible-url-param');

    // Wait for logs
    await page.waitForTimeout(2000);

    // Verify GitHub activity in logs
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((log) => log.includes('Starting fetch'))).toBe(true);
    expect(logs.some((log) => log.includes('Loaded footprint'))).toBe(true);

    // Open settings to verify footprints
    const settingsButton = page.getByTestId('settings-toggle-button');
    await settingsButton.click();
    await shoot('settings-opened-url-param');

    await expect(page.getByTestId('injections-container')).toBeVisible({
      timeout: 5000,
    });

    const footprintRows = page.locator(
      '[data-testid^="injections-container-"]'
    );
    const count = await footprintRows.count();

    console.log(`Found ${count} footprint(s) from URL param`);
    expect(count).toBeGreaterThan(0);
    await shoot('footprints-loaded-url-param');

    console.log('\n=== All GitHub Logs (URL Param) ===');
    logs.forEach((log) => console.log(log));
    console.log('=== End GitHub Logs ===\n');
  });
});
