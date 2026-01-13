# Testing Guide - Invoice Parser Frontend

## Quick Start

### 1. Start the Development Server
```bash
npm run dev
```
- Application will be available at: `http://localhost:3000`
- Dev server will reload on file changes

### 2. Ensure Backend is Running
The backend API must be running on `http://localhost:8080`
- POST `/extract` - Invoice upload endpoint
- GET `/invoice/{id}` - Invoice details endpoint
- GET `/invoices/vendor/{vendor_name}` - Search by vendor endpoint

## Testing Workflow

### Test 1: Login Flow
1. Navigate to `http://localhost:3000`
   - Should redirect to `/login` (no authentication)
2. Try invalid credentials
   - Username: `invalid`
   - Password: `invalid`
   - Should show error: "Invalid username or password"
3. Enter correct credentials
   - Username: `admin`
   - Password: `admin`
   - Should redirect to `/dashboard`
4. Refresh page
   - Should remain logged in (localStorage persistence)
5. Click "Logout"
   - Should redirect to `/login`
   - localStorage should be cleared

### Test 2: Dashboard
1. After login, verify:
   - Dashboard displays welcome message
   - Navigation menu shows current page highlighted
   - All statistics cards visible
   - Quick action buttons visible
   - All sections render correctly

### Test 3: Upload Invoices
1. Click "Upload Invoice" in navigation or dashboard
2. Try uploading invalid file:
   - Select a .txt or .doc file
   - Should show error: "X file(s) have invalid format or size"
3. Drag and drop valid file:
   - Drag a PDF or image file to the upload area
   - File should appear in list with "Upload" button
4. Upload the file:
   - Click "Upload"
   - Should show loading spinner
   - Should show success or error message
5. On success:
   - Status should show ✓ Done
   - Should display "View Invoice #xxx" link
   - Click link to view invoice details

### Test 4: Search Invoices
1. Click "Invoices" in navigation
2. Enter vendor name (depends on backend test data):
   - Try: "Acme Corp", "Vendor Name", etc.
   - Click "Search"
3. If invoices found:
   - Table should display with columns: ID, Vendor, Amount, Date, Status
   - Try sorting by different columns
   - Pagination should work if >10 invoices
4. If no invoices found:
   - Should show "No Invoices Found" message
5. Click "View" on any invoice:
   - Should navigate to `/invoice/[id]`

### Test 5: Invoice Details
1. View an invoice:
   - All information should load
   - Should display in organized sections
   - Summary sidebar should show key metrics
2. Test Edit Mode:
   - Click "Edit" button
   - Form fields should become editable
   - Change vendor name or amount
   - Click "Save"
   - Fields should update locally
   - Click "Edit" again - changes should persist
3. Test Cancel:
   - Click "Edit"
   - Make changes
   - Click "Cancel"
   - Changes should revert
4. Test Back Navigation:
   - Click "Back to Invoices"
   - Should return to invoices list

### Test 6: Navigation
1. Test all navigation links:
   - Dashboard → Dashboard page loads
   - Upload Invoice → Upload page loads
   - Invoices → Invoices page loads
   - Logo → Dashboard page (from any page)
2. Test mobile menu (on small screen):
   - Menu items should appear in dropdown
   - Logout should work from dropdown
3. Test active page indicator:
   - Current page should be highlighted
   - Should update when navigating

### Test 7: Responsive Design
1. Test on different screen sizes:
   - Desktop (1920px): Full layout
   - Tablet (768px): Responsive columns
   - Mobile (375px): Single column, dropdown menu
2. Use browser dev tools to test:
   - iPhone 12
   - iPad Pro
   - Galaxy S21

### Test 8: Error Handling
1. Backend connection error:
   - Stop backend server
   - Try to search invoices
   - Should show error message
2. Invalid invoice ID:
   - Manually navigate to `/invoice/invalid-id`
   - Should show "Invoice Not Found" error
3. Upload large file:
   - Try file > 50MB
   - Should show size validation error

### Test 9: Notifications
1. Login success:
   - Should show success toast
2. Invalid login:
   - Should show error toast
3. File upload success:
   - Should show success toast with filename
4. File upload error:
   - Should show error toast
5. Invoice search:
   - Success: "Found X invoice(s)" toast
   - No results: "No invoices found" info message

### Test 10: Form Validation
1. Login form:
   - Submit with empty fields - buttons should be disabled
   - Both fields required
2. Upload:
   - File type validation working
   - File size validation working
3. Invoice edit:
   - Edit fields work correctly
   - Data persists on save

## API Response Testing

### Test Backend Integration

#### Test POST /extract
```bash
curl -X POST http://localhost:8080/extract \
  -F "file=@/path/to/invoice.pdf"
```
Expected response:
```json
{
  "invoiceId": "INV-001",
  "vendor": "Acme Corp",
  "amount": 1500.00,
  "date": "2024-01-15",
  "status": "completed"
}
```

#### Test GET /invoice/{id}
```bash
curl http://localhost:8080/invoice/INV-001
```
Expected response:
```json
{
  "invoiceId": "INV-001",
  "vendor": "Acme Corp",
  "amount": 1500.00,
  "date": "2024-01-15",
  "status": "completed",
  "items": [...]
}
```

#### Test GET /invoices/vendor/{vendor_name}
```bash
curl http://localhost:8080/invoices/vendor/Acme%20Corp
```
Expected response:
```json
{
  "invoices": [...],
  "count": 5
}
```

## Performance Testing

### Check Loading Times
1. Dashboard load: Should be < 1s
2. Invoices search: Should be < 2s (depends on backend)
3. Invoice details: Should be < 1.5s

### Check Network Usage
1. Open DevTools → Network tab
2. Check bundled JavaScript size
3. Check image optimization
4. Monitor API response times

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari
- ✅ Chrome Mobile

## Accessibility Testing

1. Tab navigation:
   - All interactive elements reachable
   - Tab order is logical
2. Screen reader compatibility:
   - Use Voice Over (Mac) or Narrator (Windows)
   - Form labels read correctly
   - Buttons have proper labels
3. Color contrast:
   - All text has sufficient contrast
   - No color-only indicators

## Security Testing

1. Authentication:
   - Credentials not exposed in console
   - Token stored securely in localStorage
   - Can't access protected routes without login
2. Form inputs:
   - No XSS vulnerabilities
   - File upload validation
   - Input sanitization

## Debug Tips

### Enable Network Logging
In browser console:
```javascript
// Monitor API calls
window.addEventListener('fetch', (e) => {
  console.log('Fetch:', e.request.url);
});
```

### Check Authentication State
```javascript
// Check localStorage
console.log(localStorage.getItem('auth_token'));

// Check auth context
// (visible in React DevTools)
```

### Debug Slow Responses
1. Open DevTools → Network tab
2. Sort by time
3. Check which requests are slowest
4. Investigate backend performance

## Troubleshooting

### Issue: "Cannot connect to backend"
- Verify backend running on localhost:8080
- Check browser console for error messages
- Verify API_BASE_URL in lib/api.ts

### Issue: "Page won't load"
- Check browser console for errors
- Clear browser cache: Ctrl+Shift+Delete
- Check terminal for server errors

### Issue: "Login not working"
- Check localStorage is enabled
- Try incognito/private mode
- Clear browser data and try again

### Issue: "File upload fails"
- Verify file format (PDF, JPEG, PNG, GIF, WebP)
- Check file size < 50MB
- Verify backend /extract endpoint working

## Test Data

### Sample Vendor Names for Search
- Acme Corp
- Global Supplies Inc
- Tech Solutions Ltd
- Office Depot
- Amazon Business

### Sample Invoice IDs
- INV-001
- INV-2024-001
- INVOICE-123456

## Checklist for Release

- [ ] All pages load without errors
- [ ] Authentication works correctly
- [ ] File upload functional
- [ ] Invoice search working
- [ ] Invoice details display correctly
- [ ] Navigation responsive
- [ ] Mobile design works
- [ ] No console errors
- [ ] Backend API responds correctly
- [ ] Error messages display properly
- [ ] Loading states visible
- [ ] All buttons clickable
- [ ] Forms validate inputs
- [ ] Notifications display correctly
- [ ] Build command successful

---

**Ready for Testing!**

Start with `npm run dev` and test according to this guide.
