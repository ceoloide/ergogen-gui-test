import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test('should show/hide panels correctly on mobile and resize', async ({
    page,
  }) => {
    // Set viewport to a mobile size
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');

    const configEditor = page.locator('.show-config > div:first-of-type');
    const outputPanel = page.locator('.show-config > div:last-of-type');
    const configButton = page.getByRole('button', { name: 'Config' });
    const outputsButton = page.getByRole('button', { name: 'Outputs' });

    // 1. On mobile, "Config" is active, editor is visible, output is hidden
    await expect(configEditor).toBeVisible();
    await expect(outputPanel).toBeHidden();

    // 2. Click "Outputs" button
    await outputsButton.click();

    const configEditorAfterClick = page.locator(
      '.show-outputs > div:first-of-type'
    );
    const outputPanelAfterClick = page.locator(
      '.show-outputs > div:last-of-type'
    );

    // 3. Editor is hidden, output is visible
    await expect(configEditorAfterClick).toBeHidden();
    await expect(outputPanelAfterClick).toBeVisible();

    // 4. Resize to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

    const configEditorDesktop = page.locator(
      '.show-outputs > div:first-of-type'
    );
    const outputPanelDesktop = page.locator('.show-outputs > div:last-of-type');

    // 5. Both panels are visible on desktop
    await expect(configEditorDesktop).toBeVisible();
    await expect(outputPanelDesktop).toBeVisible();

    // 6. Click "Config" button on desktop
    await configButton.click();

    const configEditorDesktopAfterClick = page.locator(
      '.show-config > div:first-of-type'
    );
    const outputPanelDesktopAfterClick = page.locator(
      '.show-config > div:last-of-type'
    );

    // 7. Both panels should still be visible
    await expect(configEditorDesktopAfterClick).toBeVisible();
    await expect(outputPanelDesktopAfterClick).toBeVisible();
  });
});
