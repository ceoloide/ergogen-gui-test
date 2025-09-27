from playwright.sync_api import sync_playwright, expect
import os

CONFIG_LOCAL_STORAGE_KEY = 'LOCAL_STORAGE_CONFIG'

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Use an init script to set local storage before the page loads.
        context.add_init_script(f"""
            localStorage.setItem('{CONFIG_LOCAL_STORAGE_KEY}', JSON.stringify({{ 'points': {{}} }}));
        """)

        page = context.new_page()

        # Go to the app.
        page.goto("http://localhost:3000")

        # 1. Verify the main page is loaded by waiting for the new data-testid.
        expect(page.get_by_test_id('ergogen-wrapper')).to_be_visible(timeout=10000)

        # Now that we know the main app is loaded, we can safely take the screenshot.
        page.screenshot(path="jules-scratch/verification/main_page_with_plus_button.png")

        # 2. Click the plus button to navigate to the welcome page
        page.get_by_role("button", name="add").click()

        # 3. Verify the welcome page with the updated text
        expect(page).to_have_url("http://localhost:3000/new")
        expect(page.get_by_text("Welcome to Ergogen Web UI")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/welcome_page_updated_text.png")

        browser.close()

if __name__ == "__main__":
    run_verification()