from playwright.sync_api import sync_playwright

with open('jules-scratch/verification/jscad_test_config.yaml', 'r') as f:
    config = f.read()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # Paste config and generate
    page.locator('.monaco-editor').click()
    page.wait_for_timeout(500)
    page.keyboard.press('Control+A')
    page.wait_for_timeout(500)
    page.keyboard.press('Delete')
    page.wait_for_timeout(500)
    for line in config.splitlines():
        page.keyboard.insert_text(line)
        page.keyboard.press('Enter')
    page.wait_for_timeout(1000) # wait for debounce
    page.get_by_role("button", name="Generate").click()
    page.wait_for_timeout(2000) # wait for generation

    # Enable jscad preview
    page.get_by_test_id("settings-button").click()
    page.get_by_label("JSCAD Preview").check()
    page.get_by_test_id("settings-button").click()

    # Open jscad preview
    page.screenshot(path="jules-scratch/verification/before_jscad_link_click.png")
    page.get_by_role("link", name="test_case.jscad").click()

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()
