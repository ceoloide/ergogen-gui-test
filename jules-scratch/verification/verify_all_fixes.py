from playwright.sync_api import sync_playwright, expect
import os

CONFIG_LOCAL_STORAGE_KEY = 'LOCAL_STORAGE_CONFIG'

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # --- Desktop View ---
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:3000/new", wait_until="networkidle")
        expect(page.get_by_text("Welcome to Ergogen Web UI")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/desktop_welcome_page.png")

        # --- Mobile View ---
        page.set_viewport_size({"width": 375, "height": 667})
        # No need to navigate again, just resize and screenshot
        page.screenshot(path="jules-scratch/verification/mobile_welcome_page.png")

        # --- Functional Test ---
        # Navigate to the main page by selecting an empty config
        page.get_by_role("button", name="Empty Configuration").click()
        # Verify the header and the plus button are visible on the main page
        expect(page).to_have_url("http://localhost:3000/")
        expect(page.get_by_role("banner")).to_be_visible()
        expect(page.get_by_role("button", name="add")).to_be_visible()
        # A simple check to ensure the main app has loaded without any errors
        expect(page.locator("text=Error:")).not_to_be_visible()
        page.screenshot(path="jules-scratch/verification/final_main_page.png")

        browser.close()

if __name__ == "__main__":
    run_verification()