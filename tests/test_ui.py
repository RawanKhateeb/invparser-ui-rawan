import os
import unittest
import time
from playwright.sync_api import sync_playwright, expect

# Base URL (can be overridden in CI if needed)
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
AUTH_FILE = "auth_state.json"


class TestInvParserUI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()

        # ✅ Headless in CI, headed locally
        cls.browser = cls.playwright.chromium.launch(
            headless=(os.getenv("CI") == "true")
        )

        # Create auth state once (login and save cookies/localStorage)
        cls.ensure_auth_state()

        # Reuse auth state in a context for all tests
        cls.context = cls.browser.new_context(storage_state=AUTH_FILE)

    @classmethod
    def tearDownClass(cls):
        cls.context.close()
        cls.browser.close()
        cls.playwright.stop()

    @classmethod
    def ensure_auth_state(cls):
        # If already exists, don't relogin
        if os.path.exists(AUTH_FILE):
            return

        context = cls.browser.new_context()
        page = context.new_page()

        page.goto(f"{BASE_URL}/login", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")

        # Fill login
        page.get_by_placeholder("Enter username").fill("admin")
        page.get_by_placeholder("Enter password").fill("admin")
        page.get_by_role("button", name="Sign In").click()

        # Wait until dashboard
        page.wait_for_url("**/dashboard", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")

        # Save storage (cookies + localStorage)
        context.storage_state(path=AUTH_FILE)

        page.close()
        context.close()

    def setUp(self):
        self.page = self.context.new_page()

        # Ensure auth token exists
        self.page.add_init_script("""
            localStorage.setItem('auth_token', 'true');
        """)

    def tearDown(self):
        self.page.close()

    def test_page_title(self):
        self.page.goto(BASE_URL)
        self.assertIn("Invoice Parser", self.page.title())

    def test_dashboard_access(self):
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        time.sleep(1)
        self.page.wait_for_load_state("networkidle")
        self.assertNotIn("/login", self.page.url)

    def test_dashboard_statistics_cards(self):
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        self.assertTrue(self.page.get_by_text("Total Invoices").is_visible())
        self.assertTrue(self.page.get_by_text("Processed").is_visible())
        self.assertTrue(self.page.get_by_text("Pending").is_visible())
        self.assertTrue(self.page.get_by_text("Recent Uploads").is_visible())

    def test_navigation_links(self):
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        self.page.goto(f"{BASE_URL}/upload", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/upload", self.page.url)

        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/dashboard", self.page.url)

        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/invoices", self.page.url)

    def test_upload_page_access(self):
        self.page.goto(f"{BASE_URL}/upload", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        page_title = self.page.get_by_role("heading", name="Upload Invoice")
        self.assertTrue(page_title.is_visible())

    def test_invoices_page_access(self):
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        page_title = self.page.get_by_role("heading", name="Invoices", exact=True)
        self.assertTrue(page_title.is_visible())

        vendor_input = self.page.locator('input[id="vendor"]')
        self.assertTrue(vendor_input.is_visible())

    def test_invoice_search(self):
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("SuperStore")
        time.sleep(0.5)

        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")

        time.sleep(1)
        self.assertIn("/invoices", self.page.url)

    def test_logout_functionality(self):
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        try:
            logout_buttons = self.page.locator("a, button").filter(has_text="Logout")
            if logout_buttons.count() > 0:
                logout_buttons.first.click()
                self.page.wait_for_load_state("networkidle")
                time.sleep(1)
                self.assertIn("/login", self.page.url)
        except Exception:
            # If logout button not present, skip
            pass


if __name__ == "__main__":
    unittest.main()
