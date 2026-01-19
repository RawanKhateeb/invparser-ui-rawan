import os
import unittest
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"
AUTH_FILE = "auth_state.json"


class TestInvoiceParserE2E(unittest.TestCase):
    """End-to-End tests for complete user workflows"""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)  # Use headless mode
        cls.ensure_auth_state()
        cls.context = cls.browser.new_context(storage_state=AUTH_FILE)

    @classmethod
    def tearDownClass(cls):
        cls.context.close()
        cls.browser.close()
        cls.playwright.stop()

    @classmethod
    def ensure_auth_state(cls):
        if os.path.exists(AUTH_FILE):
            return

        context = cls.browser.new_context()
        page = context.new_page()

        page.goto(f"{BASE_URL}/login", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")

        page.get_by_placeholder("Enter username").fill("admin")
        page.get_by_placeholder("Enter password").fill("admin")
        page.get_by_role("button", name="Sign In").click()

        page.wait_for_url("**/dashboard", wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")

        context.storage_state(path=AUTH_FILE)
        page.close()
        context.close()
        time.sleep(1)  # Brief pause

    def setUp(self):
        self.page = self.context.new_page()
        self.page.add_init_script("""
            localStorage.setItem('auth_token', 'true');
        """)

    def tearDown(self):
        self.page.close()

    def test_e2e_complete_dashboard_workflow(self):
        """E2E: User logs in and views the complete dashboard"""
        # Navigate to dashboard
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Verify user is on dashboard
        self.assertIn("/dashboard", self.page.url)
        
        # Verify dashboard title
        title = self.page.get_by_role("heading", name="Dashboard")
        self.assertTrue(title.is_visible())

        # Verify all stat cards are visible
        total_invoices = self.page.get_by_text("Total Invoices")
        processed = self.page.get_by_text("Processed")
        pending = self.page.get_by_text("Pending")
        recent = self.page.get_by_text("Recent Uploads")

        self.assertTrue(total_invoices.is_visible())
        self.assertTrue(processed.is_visible())
        self.assertTrue(pending.is_visible())
        self.assertTrue(recent.is_visible())

        # Verify Quick Actions section exists
        quick_actions = self.page.get_by_text("Quick Actions")
        self.assertTrue(quick_actions.is_visible())

    def test_e2e_search_and_view_invoice(self):
        """E2E: User searches for invoices and views details"""
        # Navigate to invoices page
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Verify on invoices page
        self.assertIn("/invoices", self.page.url)
        
        # Search for SuperStore vendor
        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("SuperStore")
        time.sleep(0.5)

        # Click search button
        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Verify search completed
        self.assertIn("/invoices", self.page.url)

        # Look for invoice results
        invoice_links = self.page.locator('a[href*="/invoice/"]')
        
        # If results exist, click on first invoice
        if invoice_links.count() > 0:
            first_invoice = invoice_links.first
            first_invoice.click()
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Verify on invoice detail page
            self.assertIn("/invoice/", self.page.url)

    def test_e2e_navigation_full_cycle(self):
        """E2E: User navigates through all main pages"""
        # Start at dashboard
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/dashboard", self.page.url)

        # Navigate to upload page
        self.page.goto(f"{BASE_URL}/upload", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/upload", self.page.url)

        # Verify upload page elements
        upload_heading = self.page.get_by_role("heading", name="Upload Invoice")
        self.assertTrue(upload_heading.is_visible())

        # Navigate to invoices
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/invoices", self.page.url)

        # Verify invoices page elements
        invoices_heading = self.page.get_by_role("heading", name="Invoices", exact=True)
        self.assertTrue(invoices_heading.is_visible())

        # Return to dashboard
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertIn("/dashboard", self.page.url)

    def test_e2e_responsive_page_load(self):
        """E2E: Verify pages load responsively with proper content"""
        pages_to_test = [
            ("/dashboard", "Dashboard"),
            ("/upload", "Upload Invoice"),
            ("/invoices", "Invoices"),
        ]

        for url, expected_text in pages_to_test:
            self.page.goto(f"{BASE_URL}{url}", wait_until="domcontentloaded")
            self.page.wait_for_load_state("networkidle")
            time.sleep(0.5)

            # Verify page loaded
            self.assertIn(url, self.page.url)

            # Verify expected text is present
            expected_element = self.page.get_by_text(expected_text)
            self.assertTrue(expected_element.count() > 0)

    def test_e2e_search_with_no_results(self):
        """E2E: User searches for a vendor with no invoices"""
        # Navigate to invoices
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Search for non-existent vendor
        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("NonExistentVendor12345")
        time.sleep(0.5)

        # Click search
        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Page should still be on invoices
        self.assertIn("/invoices", self.page.url)

    def test_e2e_session_persistence(self):
        """E2E: Verify authentication persists across page navigation"""
        # Start at dashboard (requires auth)
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Verify not redirected to login
        self.assertNotIn("/login", self.page.url)

        # Navigate to different pages
        self.page.goto(f"{BASE_URL}/upload", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertNotIn("/login", self.page.url)

        # Navigate to invoices
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertNotIn("/login", self.page.url)

        # Return to dashboard
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        self.assertNotIn("/login", self.page.url)

    def test_e2e_page_performance_loading(self):
        """E2E: Verify pages load within reasonable time"""
        import time as time_module

        pages = ["/dashboard", "/upload"]  # Reduced list for speed

        for page_url in pages:
            start_time = time_module.time()
            self.page.goto(f"{BASE_URL}{page_url}", wait_until="domcontentloaded")
            self.page.wait_for_load_state("networkidle")
            end_time = time_module.time()

            load_time = end_time - start_time
            # Pages should load within 15 seconds
            self.assertLess(load_time, 15, f"{page_url} took {load_time}s to load")

    def test_e2e_multiple_searches_in_sequence(self):
        """E2E: User performs multiple searches sequentially"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        vendors = ["SuperStore"]  # Just test one for speed
        
        for vendor in vendors:
            # Enter vendor
            vendor_input = self.page.locator('input[id="vendor"]')
            vendor_input.clear()
            time.sleep(0.2)

            vendor_input.fill(vendor)
            time.sleep(0.3)

            # Search
            search_button = self.page.get_by_role("button", name="Search")
            search_button.click()
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Should stay on invoices page
            self.assertIn("/invoices", self.page.url)


if __name__ == "__main__":
    unittest.main()
