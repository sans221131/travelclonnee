# Invoice Amount & Provider Changes

## Summary
Fixed invoice creation to store amounts as entered (no conversion) and made Razorpay link required with validation.

## Changes Made

### 1. Amount Field (No Conversion)
**Previous Behavior:** Amount was stored in paise/cents (e.g., 100000 for ₹1000)
**New Behavior:** Amount is stored as entered (e.g., 1000 for ₹1000)

#### Files Modified:
- `app/admin/create-invoice/page.tsx`
  - Changed label from "Amount (in paise/cents)" to "Amount"
  - Updated placeholder text
  - Updated helper text
  - Amount sent as-is to API (still parsed as integer)

- `app/api/invoices/route.ts`
  - Amount saved directly without conversion
  
- `app/admin/check-invoice/page.tsx`
  - Removed `/100` division in `formatAmount()` function
  - Amount displayed as-is with currency formatting
  
- `components/invoice/InvoiceQuickPay.tsx`
  - Removed `/100` conversion when transforming API response
  - Amount displayed as-is

### 2. Provider Changes
**Previous:** Both "mock" and "razorpay" options available
**New:** Only "razorpay" provider available

#### Files Modified:
- `app/admin/create-invoice/page.tsx`
  - Changed `providers` array from `["mock", "razorpay"]` to `["razorpay"]`
  - Changed default provider from "mock" to "razorpay"
  - Updated form reset handler

### 3. Razorpay Link Required
**Previous:** Optional field
**New:** Required field with validation

#### Files Modified:
- `app/admin/create-invoice/page.tsx`
  - Changed field label from "Razorpay Payment Link (optional)" to "Razorpay Payment Link *"
  - Added `required` attribute to input
  - Updated helper text

- `app/api/invoices/route.ts`
  - Added validation to check if `provider_short_url` is provided
  - Added URL format validation using `new URL()`
  - Returns 400 error if missing or invalid
  - Saves `provider_short_url` from request body

### 4. Bug Fixes
**Notes Field JSON Parsing:**
- **Issue:** Using `JSON.parse()` with template literals could break if notes contain quotes
- **Fix:** Changed to direct object creation: `{ note: formData.notes }`
- **File:** `app/admin/create-invoice/page.tsx`

## Testing Checklist

### Invoice Creation
- [ ] Create invoice with amount 1000 - should display ₹1000.00 (not ₹10.00)
- [ ] Provider dropdown only shows "Razorpay"
- [ ] Cannot submit form without Razorpay link
- [ ] Invalid URL shows error message
- [ ] Valid Razorpay link is saved and displayed

### Invoice Display
- [ ] Check Invoice page shows correct amount (no extra zeros or decimal errors)
- [ ] Razorpay link appears in Invoice Details section
- [ ] Link is clickable and opens in new tab
- [ ] "Back to All Invoices" button works

### Main Page (InvoiceQuickPay)
- [ ] Enter invoice reference, amount displays correctly
- [ ] Payment link button opens correct URL
- [ ] Step progression: 1 → 2 → 3 (no skipping)

## API Validation Flow

```
POST /api/invoices
├─ Validate amount_in_paise > 0
├─ Validate provider_short_url exists
├─ Validate provider_short_url is valid URL
└─ Save invoice with all fields
```

## Database Schema
No schema changes required. The `amount_in_paise` column name remains the same, but now stores the actual display amount instead of smallest unit.

**Important:** This is a breaking change for existing invoices. Old invoices with amounts in paise/cents will display incorrectly. Consider running a migration script to convert old values.

## Migration Script (If Needed)
```sql
-- If you have existing invoices that need conversion
-- This would divide all amounts by 100
UPDATE invoices 
SET amount_in_paise = amount_in_paise / 100 
WHERE created_at < '2025-10-07';  -- Only old invoices
```

**Note:** Only run this if you have existing invoices created before this change.
