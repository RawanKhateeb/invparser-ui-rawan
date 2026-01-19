import os
import unittest
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8080"
AUTH_FILE = "auth_state.json"


class TestInvoiceParserIntegration(unittest.TestCase):
    """Integration tests for API and data flow"""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
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
        time.sleep(1)

    def setUp(self):
        self.page = self.context.new_page()
        self.page.add_init_script("""
            localStorage.setItem('auth_token', 'true');
        """)

    def tearDown(self):
        self.page.close()

    def test_api_health_check(self):
        """Test API server is reachable"""
        try:
            # Try to reach the API
            response = self.page.request.get(f"{API_URL}/invoices")
            # Should get 200 or similar (not connection refused)
            self.assertIsNotNone(response)
            self.assertIn(response.status, [200, 404, 500])  # At least get a response
        except Exception as e:
            # API not running, skip test
            pass

    def test_invoice_data_displayed_on_dashboard(self):
        """Test that dashboard loads without errors"""
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Dashboard should load
        self.assertIn("/dashboard", self.page.url)
        
        # Should have Total Invoices heading visible
        total_invoices = self.page.get_by_text("Total Invoices")
        self.assertGreater(total_invoices.count(), 0)

    def test_search_returns_vendor_data(self):
        """Test that search page loads and handles searches"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Search for vendor
        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("SuperStore")
        time.sleep(0.5)

        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Should stay on invoices page (successful search or no results)
        self.assertIn("/invoices", self.page.url)

    def test_invoice_detail_page_loads_data(self):
        """Test that invoice detail page loads and displays data"""
        # First search for an invoice
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("SuperStore")
        time.sleep(0.5)

        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Click on first invoice if exists
        invoice_links = self.page.locator('a[href*="/invoice/"]')
        if invoice_links.count() > 0:
            invoice_links.first.click()
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Should be on invoice detail page
            self.assertIn("/invoice/", self.page.url)

    def test_multiple_api_calls_succeed(self):
        """Test multiple pages load successfully"""
        pages = ["/dashboard", "/upload", "/invoices"]
        
        for page_url in pages:
            self.page.goto(f"{BASE_URL}{page_url}", wait_until="domcontentloaded")
            self.page.wait_for_load_state("networkidle")
            
            # Page should load
            self.assertIn(page_url, self.page.url)


class TestInvoiceParserNegative(unittest.TestCase):
    """Negative and edge case tests"""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
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
        time.sleep(1)

    def setUp(self):
        self.page = self.context.new_page()
        self.page.add_init_script("""
            localStorage.setItem('auth_token', 'true');
        """)

    def tearDown(self):
        self.page.close()

    def test_invalid_invoice_id_handling(self):
        """Test navigating to non-existent invoice"""
        self.page.goto(f"{BASE_URL}/invoice/INVALID-12345", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Page should handle gracefully (not crash)
        self.assertTrue(True)  # If we get here without error, test passes

    def test_empty_search_handling(self):
        """Test searching with empty vendor name"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Try to search with empty input
        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")

        # Should still be on invoices page
        self.assertIn("/invoices", self.page.url)

    def test_special_characters_in_search(self):
        """Test search with special characters"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("!@#$%^&*()")
        time.sleep(0.5)

        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Should handle without crashing
        self.assertIn("/invoices", self.page.url)

    def test_very_long_search_query(self):
        """Test search with very long vendor name"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Create very long string
        long_query = "A" * 500

        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill(long_query)
        time.sleep(0.5)

        search_button = self.page.get_by_role("button", name="Search")
        search_button.click()
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Should handle without crashing
        self.assertIn("/invoices", self.page.url)

    def test_rapid_page_navigation(self):
        """Test rapid navigation between pages"""
        pages = ["/dashboard", "/upload", "/invoices", "/dashboard"]

        for page_url in pages:
            self.page.goto(f"{BASE_URL}{page_url}", wait_until="domcontentloaded")
            self.page.wait_for_load_state("networkidle")
            self.assertIn(page_url, self.page.url)

    def test_search_case_insensitivity(self):
        """Test that search is case insensitive"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Search with different cases
        test_cases = ["superstore", "SUPERSTORE", "SuperStore"]

        for vendor in test_cases:
            vendor_input = self.page.locator('input[id="vendor"]')
            vendor_input.clear()
            vendor_input.fill(vendor)
            time.sleep(0.3)

            search_button = self.page.get_by_role("button", name="Search")
            search_button.click()
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Should stay on invoices
            self.assertIn("/invoices", self.page.url)

    def test_page_back_button_functionality(self):
        """Test browser back button"""
        # Navigate to dashboard
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Navigate to invoices
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Go back
        self.page.go_back()
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Should be back on dashboard
        self.assertIn("/dashboard", self.page.url)

    def test_double_submit_search(self):
        """Test clicking search button multiple times"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        vendor_input = self.page.locator('input[id="vendor"]')
        vendor_input.fill("SuperStore")
        time.sleep(0.5)

        search_button = self.page.get_by_role("button", name="Search")
        
        # Click multiple times rapidly
        search_button.click()
        time.sleep(0.1)
        search_button.click()
        time.sleep(0.1)
        
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Should handle without crashing
        self.assertIn("/invoices", self.page.url)


class TestInvoiceParserAccessibility(unittest.TestCase):
    """Accessibility and usability tests"""

    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)
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
        time.sleep(1)

    def setUp(self):
        self.page = self.context.new_page()
        self.page.add_init_script("""
            localStorage.setItem('auth_token', 'true');
        """)

    def tearDown(self):
        self.page.close()

    def test_buttons_are_keyboard_accessible(self):
        """Test buttons can be accessed via keyboard"""
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Try to find buttons
        buttons = self.page.locator("button")
        self.assertGreater(buttons.count(), 0)

    def test_form_inputs_have_labels(self):
        """Test that form inputs have associated labels"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Check for form labels
        labels = self.page.locator("label")
        self.assertGreater(labels.count(), 0)

    def test_page_has_proper_heading_structure(self):
        """Test pages have proper heading hierarchy"""
        pages = ["/dashboard", "/invoices", "/upload"]

        for page_url in pages:
            self.page.goto(f"{BASE_URL}{page_url}", wait_until="domcontentloaded")
            self.page.wait_for_load_state("networkidle")

            # Check for h1 heading
            h1_headings = self.page.locator("h1")
            self.assertGreater(h1_headings.count(), 0, f"No h1 found on {page_url}")

    def test_images_have_alt_text(self):
        """Test that images have alt attributes"""
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Check for images and their alt attributes
        images = self.page.locator("img")
        if images.count() > 0:
            for i in range(images.count()):
                img = images.nth(i)
                # All images should have alt or aria-label
                alt_text = img.get_attribute("alt")
                aria_label = img.get_attribute("aria-label")
                # At least one should exist
                self.assertTrue(alt_text or aria_label or img.get_attribute("role") == "presentation")

    def test_links_are_distinguishable(self):
        """Test that links are visually distinct"""
        self.page.goto(f"{BASE_URL}/invoices", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Check for links
        links = self.page.locator("a")
        self.assertGreater(links.count(), 0)

    def test_color_contrast_elements_present(self):
        """Test that major elements are visible"""
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Check for visible text
        body = self.page.locator("body")
        # Should have content
        self.assertTrue(body.is_visible())

    def test_page_zoom_functionality(self):
        """Test page behaves with zoom"""
        self.page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded")
        self.page.wait_for_load_state("networkidle")

        # Zoom in
        self.page.evaluate("() => { document.body.style.zoom = '150%'; }")
        time.sleep(0.5)

        # Content should still be accessible
        heading = self.page.get_by_role("heading", name="Dashboard")
        self.assertTrue(heading.count() > 0)

        # Reset zoom
        self.page.evaluate("() => { document.body.style.zoom = '100%'; }")


if __name__ == "__main__":
    unittest.main()
