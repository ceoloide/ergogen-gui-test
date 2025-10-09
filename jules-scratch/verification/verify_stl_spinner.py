import asyncio
from playwright.async_api import async_playwright, expect
import re

# This is a workaround to import the TS module in Python.
def get_config_from_ts(path):
    with open(path, 'r') as f:
        content = f.read()
    match = re.search(r"value:\s*`([\s\S]*?)`", content)
    if match:
        return match.group(1).strip()
    raise ValueError("Could not extract config from TS file.")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        adux_config = get_config_from_ts('src/examples/adux.ts')

        # Local storage setup
        config_key = 'ergogen:config'
        ls_config = {
            'state': { 'name': 'A. dux', 'contents': adux_config, 'source': 'local' },
            'version': 0,
        }
        stl_preview_key = 'ergogen:config:stlPreview'

        context = await browser.new_context()
        await context.add_init_script(f"""
            localStorage.setItem('{config_key}', JSON.stringify({ls_config!r}));
            localStorage.setItem('{stl_preview_key}', 'true');
        """)

        page = await context.new_page()
        await page.goto("http://localhost:3000")

        # Wait for the downloads container to be visible
        downloads_container = page.locator('div[data-testid="downloads-container"]')
        await expect(downloads_container).to_be_visible(timeout=30000)

        # Locate the specific download row for the prototype STL
        stl_row_locator = page.locator(f'div[data-testid="downloads-container-prototype.stl"]')

        # 1. Verify loading state
        loading_button_locator = stl_row_locator.locator('[data-testid*="-loading"]')
        await expect(loading_button_locator).to_be_visible(timeout=30000)
        await page.screenshot(path="jules-scratch/verification/verification_loading.png")
        print("Captured loading state screenshot.")

        # 2. Verify completed state
        download_button_locator = stl_row_locator.locator('[data-testid*="-download"]')
        await expect(download_button_locator).to_be_visible(timeout=120000)
        await page.screenshot(path="jules-scratch/verification/verification_complete.png")
        print("Captured completed state screenshot.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())