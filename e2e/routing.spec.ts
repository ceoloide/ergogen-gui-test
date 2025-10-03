import { test, expect } from '@playwright/test';
import { CONFIG_LOCAL_STORAGE_KEY } from '../src/context/ConfigContext';
import Absolem from '../src/examples/absolem';

test.describe('Routing and Welcome Page', () => {
  test('new user is redirected to /new', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/new/);
    await expect(page.getByText('Welcome to Ergogen Grafica')).toBeVisible();
  });

  test('existing user is routed to /', async ({ page }) => {
    await page.goto('/');
    // Set local storage to simulate an existing user
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ points: {} }));
    }, CONFIG_LOCAL_STORAGE_KEY);
    await page.reload();
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByTestId('config-editor')).toBeVisible();
  });

  test('"New Design" button navigates to /new', async ({ page }) => {
    // Start as an existing user
    await page.goto('/');
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ points: {} }));
    }, CONFIG_LOCAL_STORAGE_KEY);
    await page.reload();

    // Click the "New Design" button
    await page.getByRole('link', { name: 'add' }).click();
    await expect(page).toHaveURL(/.*\/new/);
    await expect(page.getByText('Welcome to Ergogen Grafica')).toBeVisible();
  });

  test('"Empty Configuration" button loads empty config and navigates to /', async ({
    page,
  }) => {
    await page.goto('/new');
    await page.getByRole('button', { name: 'Empty Configuration' }).click();

    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByTestId('config-editor')).toBeVisible();

    const editorContent = await page.locator('.monaco-editor').textContent();
    expect(editorContent).toContain('points:');
  });

  test('clicking an example loads the config and navigates to /', async ({
    page,
  }) => {
    await page.goto('/new');
    await page.getByText('Absolem').click();

    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByTestId('config-editor')).toBeVisible();

    const editorContent = await page.locator('.monaco-editor').textContent();
    expect(editorContent).toContain(Absolem.value.substring(0, 100)); // Check for a snippet of the config
  });
});
