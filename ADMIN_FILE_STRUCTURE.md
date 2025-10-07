# Admin System File Structure

## New Files Created

```
travelclone - Copy/
│
├── components/
│   └── admin/
│       └── AdminNav.tsx ⭐ NEW - Navigation menu with 5 pages
│
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx ✏️ UPDATED - Added AdminNav
│   │   │
│   │   ├── add-activity/ ⭐ NEW
│   │   │   └── page.tsx - Form to create activities
│   │   │
│   │   ├── update-activity/ ⭐ NEW
│   │   │   └── page.tsx - Edit existing activities
│   │   │
│   │   ├── create-invoice/ ⭐ NEW
│   │   │   └── page.tsx - Generate invoices with auto-redirect
│   │   │
│   │   └── check-invoice/ ⭐ NEW
│   │       └── page.tsx - Search & view invoice status
│   │
│   └── api/
│       ├── activities/
│       │   ├── route.ts ✏️ UPDATED - Added POST endpoint
│       │   └── [id]/
│       │       └── route.ts ✏️ UPDATED - Added PATCH endpoint
│       │
│       └── invoices/ ⭐ NEW
│           ├── route.ts - GET all, POST create
│           └── [id]/
│               └── route.ts - GET, PATCH by ID/receipt
│
├── activities-sql-insert.sql ✏️ UPDATED
│   └── Added CREATE TABLE for invoices + idempotent INSERT
│
├── ADMIN_SYSTEM_README.md ⭐ NEW
│   └── Complete documentation
│
└── package.json ✏️ UPDATED
    └── Added nanoid dependency
```

## Page Routes

### Admin Pages
- `/admin` - Login page (existing)
- `/admin/dashboard` - Trip requests dashboard
- `/admin/add-activity` - Create new activity
- `/admin/update-activity` - Edit activities
- `/admin/create-invoice` - Generate invoices
- `/admin/check-invoice` - View invoice status

### API Endpoints

#### Activities
- `GET /api/activities` - List all activities
- `GET /api/activities?destinationId=dubai` - Filter by destination
- `POST /api/activities` - Create activity
- `GET /api/activities/[id]` - Get single activity
- `PATCH /api/activities/[id]` - Update activity

#### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get by ID or receipt number
- `PATCH /api/invoices/[id]` - Update invoice

## Component Hierarchy

```
AdminNav (Navigation)
├── Dashboard Link
├── Add Activity Link
├── Update Activity Link
├── Create Invoice Link
├── Check Invoice Link
└── Logout Link

Each Admin Page
├── AdminNav (top navigation)
├── Page Header (title + description)
├── Form/Content Area
└── Actions (submit, cancel, etc.)
```

## Data Flow

### Creating an Activity
```
User fills form → Submit → POST /api/activities → Database → Success notification
```

### Creating an Invoice
```
User fills form → Submit → POST /api/invoices 
→ Database saves with auto-generated receipt (LW-2025-0042)
→ Success notification
→ Auto-redirect to /?ref=LW-2025-0042 OR payment link
→ Main page detects ref → Displays invoice in InvoiceQuickPay
```

### Checking Invoice Status
```
User enters receipt → Search → GET /api/invoices/[id]
→ Display invoice details with status
```

## Color Coding by Section

| Page | Primary Color | Purpose |
|------|--------------|---------|
| Dashboard | Blue | Trip management |
| Add Activity | Blue | Create content |
| Update Activity | Purple | Edit content |
| Create Invoice | Emerald/Green | Financial actions |
| Check Invoice | Cyan | Information lookup |

## Quick Start Commands

```powershell
# Install dependencies (already done)
npm install

# Run development server
npm run dev

# Access admin portal
# http://localhost:3000/admin

# Run database migrations (if needed)
npm run drizzle:push
```

## Integration Points

### 1. Main Page Integration
- Invoice reference in URL: `/?ref=LW-2025-0042`
- InvoiceQuickPay component detects and displays invoice
- Auto-fill form with invoice data

### 2. Dashboard Integration
- AdminNav appears on all admin pages
- Consistent styling with existing components
- Shared color scheme and typography

### 3. Database Integration
- Uses existing Drizzle ORM setup
- Leverages db/client.ts connection
- Follows schema.ts definitions

## Summary Statistics

- **5 New Pages** created
- **2 New API Routes** (activities/[id], invoices/*)
- **1 New Component** (AdminNav)
- **3 Existing Files** updated
- **100% Dark Theme** consistency
- **Mobile Responsive** design throughout
