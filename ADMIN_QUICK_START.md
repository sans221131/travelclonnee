# Admin Portal - Quick Reference Guide

## 🚀 Getting Started

### 1. First Time Setup
```powershell
cd "c:\Users\somaa\Desktop\travelclone - Copy"

# Already installed, but if needed:
npm install

# Create invoices table in Neon database
# Copy SQL from activities-sql-insert.sql and run in Neon console
```

### 2. Start the Server
```powershell
npm run dev
```

### 3. Access Admin Portal
Open browser: `http://localhost:3000/admin`

## 📱 Admin Pages Overview

### Dashboard (`/admin/dashboard`)
**Purpose:** View all trip requests with activities
- See customer details
- Filter by status and destination
- Sort by date, name, destination
- Search trips
- Update trip status

### Add Activity (`/admin/add-activity`)
**Purpose:** Create new tourist activities
**Required Fields:**
- Destination (dropdown)
- Activity Name
- Description
- Price (numeric)
- Currency (dropdown)
- Image URL

**Optional:**
- Review Count (defaults to 0)

**Example:**
```
Destination: Dubai
Name: Desert Safari Adventure
Description: Exciting dune bashing with dinner
Price: 85.00
Currency: USD
Image URL: /images/dubai.jpg
```

### Update Activity (`/admin/update-activity`)
**Purpose:** Edit existing activities
**How to Use:**
1. Search/browse activities in left panel
2. Click activity to select
3. Edit any field
4. Toggle active/inactive status
5. Save changes

### Create Invoice (`/admin/create-invoice`)
**Purpose:** Generate payment invoices
**Required Fields:**
- Customer Name
- Amount in paise/cents (e.g., 100000 = ₹1000 or $1000)
- Currency
- Provider (mock or razorpay)

**Optional:**
- Customer Email
- Customer Phone
- Notes

**What Happens:**
1. Invoice created with unique ID
2. Receipt number generated (e.g., LW-2025-0042)
3. Auto-redirects to:
   - Payment link (if available)
   - Main page with invoice ref: `/?ref=LW-2025-0042`

### Check Invoice (`/admin/check-invoice`)
**Purpose:** Look up invoice status
**How to Use:**
1. Enter invoice ID or receipt number
2. Click Search
3. View complete details:
   - Payment status
   - Customer info
   - Amount
   - Provider details
   - Payment link

## 🎯 Common Tasks

### Task 1: Add a New Activity
```
1. Navigate to "Add Activity"
2. Select destination
3. Enter activity details
4. Set price and currency
5. Add image URL
6. Click "Create Activity"
7. See success message
8. Form auto-resets for next entry
```

### Task 2: Edit Activity Price
```
1. Navigate to "Update Activity"
2. Search for activity
3. Click to select
4. Change price field
5. Click "Save Changes"
6. See success notification
```

### Task 3: Create Customer Invoice
```
1. Navigate to "Create Invoice"
2. Fill customer details
3. Enter amount in paise (e.g., 250000 for ₹2500)
4. Select currency (INR)
5. Choose provider
6. Click "Create Invoice"
7. Note the receipt number (e.g., LW-2025-0042)
8. Auto-redirects to payment page
```

### Task 4: Check Payment Status
```
1. Navigate to "Check Invoice"
2. Enter receipt number (e.g., LW-2025-0042)
3. Click Search
4. View status: draft/issued/paid/expired
5. Click payment link if available
```

## 💡 Pro Tips

### For Activities
- ✅ Use descriptive names (helps users find activities)
- ✅ Include what's included in description
- ✅ Match image URL to destination
- ✅ Set realistic review counts
- ✅ Double-check currency matches destination

### For Invoices
- ✅ Amount is in smallest unit (paise/cents)
  - ₹1000 = 100000 paise
  - $50 = 5000 cents
- ✅ Receipt numbers are auto-generated (LW-YYYY-####)
- ✅ Mock provider for testing
- ✅ Razorpay for production
- ✅ Save receipt number for customer

### Navigation
- 🔵 Blue = Data/Dashboard
- 🟣 Purple = Editing
- 🟢 Green = Creating
- 🔷 Cyan = Checking/Viewing

## 🔧 Troubleshooting

### Issue: Can't create activity
**Solution:** Check all required fields are filled
- Ensure destination is selected
- Price must be valid number
- Image URL must be valid path

### Issue: Invoice not found
**Solution:** Verify receipt number format
- Should be: LW-YYYY-#### (e.g., LW-2025-0042)
- Check for typos
- Search is case-insensitive

### Issue: Activities not updating
**Solution:** Refresh the page
- Changes save to database immediately
- List updates after save
- Hard refresh if needed (Ctrl+F5)

### Issue: Navigation not showing
**Solution:** Clear cache and reload
- AdminNav should appear on all admin pages
- Check browser console for errors
- Verify you're on admin route

## 📊 Database Schema Quick Reference

### Activities Table
```
id (uuid)
destination_id (varchar)
name (varchar 200)
description (text)
price (numeric 10,2)
currency (varchar 3)
review_count (integer)
image_url (varchar 500)
is_active (boolean)
```

### Invoices Table
```
id (text)
receipt (text, unique) - LW-2025-####
customer_name (text)
customer_email (text)
customer_phone (text)
amount_in_paise (integer)
currency (text)
provider (text) - mock/razorpay
status (text) - draft/issued/paid/expired/cancelled
notes (jsonb)
```

## 🎨 UI Components Used

- **Forms:** Input, Select, Textarea
- **Icons:** Lucide React
- **Buttons:** Primary (colored), Secondary (outline)
- **Notifications:** Success (green), Error (red)
- **Loading:** Spinner animations
- **Search:** With icon, real-time filter

## 🔐 Security Notes

### Current Setup
- Admin routes accessible after login
- API routes use server-side execution
- Database queries parameterized (safe from SQL injection)

### Recommended Additions
- Add session management
- Implement RBAC (Role-Based Access Control)
- Add CSRF protection
- Rate limit API endpoints
- Log admin actions

## 📞 Support

### File Locations
- Navigation: `components/admin/AdminNav.tsx`
- Pages: `app/admin/[page-name]/page.tsx`
- APIs: `app/api/[resource]/route.ts`

### Documentation
- `ADMIN_SYSTEM_README.md` - Complete feature docs
- `ADMIN_FILE_STRUCTURE.md` - File organization
- This file - Quick reference

### Testing URLs
```
Login:          http://localhost:3000/admin
Dashboard:      http://localhost:3000/admin/dashboard
Add Activity:   http://localhost:3000/admin/add-activity
Update Activity: http://localhost:3000/admin/update-activity
Create Invoice: http://localhost:3000/admin/create-invoice
Check Invoice:  http://localhost:3000/admin/check-invoice
```

## ✨ Happy Administrating!

All features are fully functional and ready to use. The admin portal integrates seamlessly with your main travel booking site.
