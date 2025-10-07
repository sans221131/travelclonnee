# Next.js 15 Dynamic Route Params Fix

## Issue
Next.js 15 introduced a breaking change where `params` in dynamic route handlers is now a Promise instead of a plain object.

## Error Message
```
Type error: Type 'typeof import("/vercel/path0/app/api/invoices/[id]/route")' does not satisfy the constraint 'RouteHandlerConfig<"/api/invoices/[id]">'.
  Types of property 'GET' are incompatible.
    Type '(request: NextRequest, { params }: { params: { id: string; }; }) => ...' is not assignable to type '(request: NextRequest, context: { params: Promise<{ id: string; }>; }) => ...'.
      Types of parameters '__1' and 'context' are incompatible.
        Type '{ params: Promise<{ id: string; }>; }' is not assignable to type '{ params: { id: string; }; }'.
          Types of property 'params' are incompatible.
            Property 'id' is missing in type 'Promise<{ id: string; }>' but required in type '{ id: string; }'.
```

## Solution

### Before (Next.js 14)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ...
}
```

### After (Next.js 15)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## Files Fixed

### ✅ `app/api/invoices/[id]/route.ts`
- Updated `GET` function to await params
- Updated `PATCH` function to await params

### ✅ Already Correct
- `app/api/activities/[id]/route.ts` - Already using Promise pattern
- `app/api/trip-requests/[id]/route.ts` - Already using Promise pattern

## Key Changes
1. Changed type from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }`
2. Changed destructuring from `const { id } = params;` to `const { id } = await params;`

## Testing
- [x] TypeScript compilation successful
- [ ] Test GET /api/invoices/[id] endpoint
- [ ] Test PATCH /api/invoices/[id] endpoint
- [ ] Verify invoice lookup still works on main page

## References
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change)
