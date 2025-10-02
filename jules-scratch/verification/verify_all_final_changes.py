from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Start on the welcome page, create a config to navigate to the editor
    page.goto("http://localhost:3000/new")
    page.get_by_role("button", name="Empty Configuration").click(force=True)
    page.wait_for_url("http://localhost:3000/")

    # 2. Go to settings and disable auto-generation
    page.get_by_role("button", name="settings").click(force=True)
    autogen_checkbox = page.locator('input[id="autogen"]')
    expect(autogen_checkbox).to_be_visible()
    if autogen_checkbox.is_checked():
        autogen_checkbox.click(force=True)
    expect(autogen_checkbox).not_to_be_checked()
    page.get_by_role("button", name="settings").click(force=True) # Close settings

    # 3. Trigger an error banner
    page.locator('.monaco-editor').first.click(force=True)
    page.keyboard.type('this is not valid yaml')
    page.get_by_role("button", name="Generate").click(force=True)

    # 4. Verify the error banner appears with the new styling
    error_banner = page.locator('div[type="error"]')
    expect(error_banner).to_be_visible(timeout=5000)
    expect(error_banner.locator("span.material-symbols-outlined")).to_have_text("error")
    page.screenshot(path="jules-scratch/verification/final_styled_banner.png")

    # 5. Dismiss the error banner and verify it stays dismissed
    error_banner.get_by_role("button").click(force=True)
    expect(error_banner).not_to_be_visible()
    page.screenshot(path="jules-scratch/verification/final_banner_dismissed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)