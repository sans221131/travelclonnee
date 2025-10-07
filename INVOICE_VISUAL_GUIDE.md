# Invoice System - Visual Guide

## 1. Main Page - Invoice Input & Review

### Initial State
```
┌─────────────────────────────────────────────────────────┐
│  Have an Invoice?                                       │
│  Enter your reference to review and continue...         │
├─────────────────────────────────────────────────────────┤
│  REF         │  INVOICE                                 │
│  LW-2025-    │  Date: 07 Oct 2025    Bill to: Somaan   │
│  6542        │  Amount: ₹1,000,000.00         Draft     │
│              │  Pay using reference: LW-2025-6542       │
│  [Barcode]   │  [Input: LW-2025-6542] [Review →]      │
└─────────────────────────────────────────────────────────┘
```

### After Clicking "Review" (NEW BEHAVIOR)
```
┌─────────────────────────────────────────────────────────┐
│  Have an Invoice?                                       │
│  Enter your reference to review and continue...         │
├─────────────────────────────────────────────────────────┤
│  [Top card FADES OUT - opacity: 0]                     │
│                                                          │
│  ↓ SMOOTH TRANSITION ↓                                 │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Paying: LW-2025-6542 · ₹1,000,000.00  [Close]        │
├─────────────────────────────────────────────────────────┤
│  Status: draft    Billed to: Somaan    Date: 07 Oct   │
│                                                          │
│  Methods: UPI 💳 NetBanking                            │
│                                                          │
│  [Open Payment Link] ← Opens Razorpay URL in new tab  │
└─────────────────────────────────────────────────────────┘
```

## 2. Admin - Create Invoice Flow

### Create Invoice Form
```
┌─────────────────────────────────────────────────────────┐
│  📄 Create Invoice                                      │
├─────────────────────────────────────────────────────────┤
│  Customer Details                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Customer Name *  [Somaan                       ]  │ │
│  │ Email           [somaan@example.com            ]  │ │
│  │ Phone           [+919876543210                 ]  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  Invoice Details                                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Amount (paise) * [100000000                    ]  │ │
│  │ Currency *       [INR ▼]  Provider [Mock ▼]   │ │
│  │                                                   │ │
│  │ ⭐ NEW FIELD                                      │ │
│  │ Razorpay Link    [https://rzp.io/l/abc123      ] │ │
│  │ (Optional)                                        │ │
│  │                                                   │ │
│  │ Notes            [Trip package payment          ] │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  [Reset Form]  [Create Invoice]                        │
└─────────────────────────────────────────────────────────┘
```

### After Creation (NEW BEHAVIOR)
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Invoice LW-2025-6542 created successfully!         │
│                                                          │
│  Redirecting to Check Invoice...                        │
└─────────────────────────────────────────────────────────┘

        ↓ AUTO REDIRECT (1 second) ↓

┌─────────────────────────────────────────────────────────┐
│  🔍 Check Invoice                                       │
│  [Search: Enter invoice ID or receipt...]  [Search]    │
├─────────────────────────────────────────────────────────┤
│  All Invoices (3)                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ LW-2025-6542 │ │ LW-2025-6543 │ │ LW-2025-6544 │   │
│  │ Somaan       │ │ John Doe     │ │ Jane Smith   │   │
│  │ ₹10,00,000   │ │ $2,499       │ │ €1,200       │   │
│  │ [Draft]      │ │ [Paid]       │ │ [Issued]     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 3. Check Invoice - All Invoices View (NEW)

### Before (Old Behavior)
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Check Invoice                                       │
│  [Search...]  [Search]                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              🔍 Search for an Invoice                   │
│       Enter invoice ID or receipt number above          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### After (NEW Behavior)
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Check Invoice                                       │
│  [Search: LW-2025...]  [Search]                        │
├─────────────────────────────────────────────────────────┤
│  All Invoices (8)                    [Sort: Newest ▼]  │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ LW-2025-6542│ │ LW-2025-6541│ │ LW-2025-6540│      │
│  │ ₹10,00,000  │ │ ₹5,00,000   │ │ ₹2,50,000   │      │
│  │ Draft       │ │ Paid ✓      │ │ Issued      │      │
│  │ Somaan      │ │ John Doe    │ │ Jane Smith  │      │
│  │ 07 Oct 2025 │ │ 06 Oct 2025 │ │ 05 Oct 2025 │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ LW-2025-6539│ │ LW-2025-6538│ │ LW-2025-6537│      │
│  │ $2,499      │ │ €1,200      │ │ £850        │      │
│  │ Expired     │ │ Cancelled   │ │ Paid ✓      │      │
│  │ Alice Brown │ │ Bob Wilson  │ │ Carol Davis │      │
│  │ 04 Oct 2025 │ │ 03 Oct 2025 │ │ 02 Oct 2025 │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Click on Invoice (Shows Details Below)
```
┌─────────────────────────────────────────────────────────┐
│  Selected Invoice: LW-2025-6542                        │
├─────────────────────────────────────────────────────────┤
│  ₹10,00,000.00                               [Draft]   │
│                                                          │
│  Customer Information     │  Invoice Details            │
│  Name: Somaan            │  Provider: Mock             │
│  Email: somaan@ex.com    │  Created: 07 Oct 2025       │
│  Phone: +91987654        │  Updated: 07 Oct 2025       │
│                          │  ID: abc123xyz              │
│                                                          │
│  [Open Payment Link] ← If provider_short_url exists    │
└─────────────────────────────────────────────────────────┘
```

## 4. Animation Sequence (Main Page)

### Timeline
```
0ms   - User clicks "Review →"
      - Top invoice card starts fading out
      
100ms - Card opacity: 80%
      - Pointer events disabled on card
      
200ms - Card opacity: 40%
      - Drawer starts expanding
      
300ms - Card opacity: 0% (fully hidden)
      - Card display: none (via pointer-events)
      
400ms - Drawer fully expanded
      - Drawer opacity: 100%
      - Content fully visible
      
DONE  - User can interact with drawer
```

## 5. Payment Link Button States

### State 1: Razorpay Link Available
```
┌─────────────────────────────────────────┐
│  [Open Payment Link 🔗]                │  ← Green button
└─────────────────────────────────────────┘
Click → Opens https://razorpay.com/... in new tab
```

### State 2: No Payment Link
```
┌─────────────────────────────────────────┐
│  [Request Payment Link]                │  ← Gray/disabled
└─────────────────────────────────────────┘
Click → Shows toast: "No payment link available"
```

### State 3: UAE User with Razorpay Integration
```
┌─────────────────────────────────────────┐
│  [Pay with Razorpay]                   │  ← White button
└─────────────────────────────────────────┘
Click → Opens Razorpay checkout modal
```

## Key Improvements Summary

| Feature | Before | After |
|---------|--------|-------|
| Invoice Preview | Always visible | Fades out when drawer opens |
| Drawer Appearance | Hard transition | Smooth fade-in |
| Payment Link | Mock button | Real Razorpay URL link |
| Create Invoice | Redirects to main | Redirects to Check Invoice |
| Check Invoice | Empty until search | Shows all invoices grid |
| Admin UX | Basic | Professional workflow |

## Color Coding

- 🟢 **Green** = Success, Payment links
- 🔵 **Blue** = Information, Links  
- 🟡 **Yellow** = Pending, Draft
- 🔴 **Red** = Error, Expired
- ⚪ **Gray** = Disabled, Cancelled
- 🟣 **Purple** = Edit/Update actions

All animations respect `prefers-reduced-motion` for accessibility!
