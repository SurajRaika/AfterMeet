import os
from playwright.sync_api import sync_playwright

def run():
    print("Starting Playwright script...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Page Error: {exc}"))

        print("Navigating to http://127.0.0.1:8000/...")
        response = page.goto("http://127.0.0.1:8000/", wait_until="load")

        if response:
            print("Response Status:", response.status)
            print("Response Status Text:", response.status_text)
        else:
            print("No response object returned!")

        page.wait_for_timeout(3000)
        print("Page Title:", page.title())
        content = page.content()
        print("Content length:", len(content))

        os.makedirs("/app/verification", exist_ok=True)
        screenshot_path = "/app/verification/aftermeet_landing.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
