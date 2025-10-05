import { test, expect } from '@playwright/test';
import Absolem from '../src/examples/absolem';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/ConfigContext';

test.describe('Routing and Welcome Page', () => {
  test('new user is redirected to /new', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/new/);
    await expect(page.getByText('Welcome to Ergogen Web UI')).toBeVisible();
  });

  test('existing user is routed to /', async ({ page }) => {
    // Simulate existing user by setting a value in local storage
    await page.addInitScript(
      (CONFIG_LOCAL_STORAGE_KEY) => {
        localStorage.setItem(
          CONFIG_LOCAL_STORAGE_KEY,
          JSON.stringify('some config')
        );
      },
      CONFIG_LOCAL_STORAGE_KEY
    );
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByTestId('config-editor')).toBeVisible();
  });

  test('"New Design" button requires existing config', async ({ page }) => {
    await page.goto('/');
    // With no config, the "New Design" button should not be visible on the main page
    await expect(
      page.getByTestId('new-design-button')
    ).not.toBeVisible();
  });

  test('"New Design" button navigates to /new', async ({ page }) => {
    const newDesignButton = page.getByTestId('new-design-button');

    // 1. Set a valid config in local storage
    await page.addInitScript(
      ({ config, key }) => {
        localStorage.setItem(key, JSON.stringify(config));
      },
      { config: Absolem.value, key: CONFIG_LOCAL_STORAGE_KEY }
    );
    await page.goto('/');

    // 2. Now the button should be visible, click it
    await newDesignButton.click();

    // 3. Assert navigation to the /new page
    await expect(page).toHaveURL(/.*\/new/);
    await expect(page.getByText('Welcome to Ergogen Web UI')).toBeVisible();
  });

  test('clicking "Empty Configuration" creates an empty config and navigates to /', async ({
    page,
  }) => {
    await page.goto('/new');
    await page.getByRole('button', { name: 'Empty Configuration' }).click();

    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByTestId('config-editor')).toBeVisible();

    const editorContent = await page.locator('.monaco-editor').textContent();
    await expect(async () => {
      const editorContent = await page.locator('.monaco-editor').textContent();
      expect(editorContent).toContain('points:');
    }).toPass();
  });

  test('clicking an example loads the config and navigates to /', async ({
    page,
  }) => {
    await page.goto('/new');
    await page.getByText(Absolem.label).click();
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByTestId('config-editor')).toBeVisible();

    await expect(page.locator('.monaco-editor')).toContainText(
      Absolem.value.substring(0, 100),
      { timeout: 10000 }
    ); // Check for a snippet of the config
  });
});
