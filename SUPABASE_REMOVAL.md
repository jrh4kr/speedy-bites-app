# Supabase Removal & Local API Migration

## Overview
All Supabase connections and configurations have been removed from the Speedy Bites app. The application now uses a local Express API server running on `localhost:4000` for all data operations.

## Changes Made

### 1. **Removed Supabase Imports**
Removed from the following files:
- ✅ `src/pages/HomePage.tsx` - Removed unused import
- ✅ `src/pages/MenuPage.tsx` - Replaced with `api` import
- ✅ `src/pages/CheckoutPage.tsx` - Removed import
- ✅ `src/pages/OrderTrackingPage.tsx` - Removed import  
- ✅ `src/pages/OrdersPage.tsx` - Removed import
- ✅ `src/pages/FavoritesPage.tsx` - Removed import
- ✅ `src/pages/MealDetailsPage.tsx` - Replaced with `api` import
- ✅ `src/components/notifications/NotificationCenter.tsx` - Removed import
- ✅ `src/contexts/AuthContext.tsx` - Completely refactored (see below)
- ⚠️ `src/components/admin/AdminMenuSection.tsx` - Stubbed out (requires API endpoints)

### 2. **Updated Data Fetching**

#### MenuPage.tsx
**Before:**
```typescript
const { data: categoriesData } = await supabase
  .from('menu_categories')
  .select('*')
  .eq('is_active', true)
```

**After:**
```typescript
const categoriesData = await api.getCategories();
```

#### MealDetailsPage.tsx
**Before:**
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('id', id)
  .single();
```

**After:**
```typescript
const data = await api.getMenuItem(id);
```

### 3. **Refactored AuthContext.tsx**

Complete rewrite to use local API instead of Supabase Auth:

**Key Changes:**
- Removed `supabase.auth.onAuthStateChange()` listener
- Removed `@supabase/supabase-js` Session type dependency
- Removed Database types from `@/integrations/supabase/types`
- Updated `login()` to use `api.login()`
- Updated `signUp()` to use `api.register()`
- Updated `logout()` to use `api.logout()`
- Simplified User interface with local role types

**New Authentication Flow:**
```typescript
login() → api.login() → setUser + api.setAuthToken()
signUp() → api.register() → setUser + api.setAuthToken()
logout() → api.logout() → clearUser + api.clearAuth()
```

### 4. **Fixed API Issues**

#### getMenuItem() Function
**Problem:** Backend doesn't support `/menu/:id` endpoint

**Solution:** Modified to fetch all items and filter locally:
```typescript
getMenuItem: async (id: string) => {
  const allItems = await apiFetch<any[]>('/menu');
  const item = allItems.find(i => i.id === id);
  // ... return formatted item
}
```

### 5. **Stubbed Components**

#### AdminMenuSection.tsx
- Disabled Supabase storage uploads
- Shows alert about API integration needed
- Requires backend API implementation for full functionality

## Supabase Files (Still Present - Not Used)

The following files exist but are no longer used:
- `src/integrations/supabase/client.ts` - Unused Supabase client
- `src/integrations/supabase/types.ts` - Unused Database types
- `src/integrations/supabase/types-new.ts` - Unused types

**Note:** These can be deleted if you don't plan to use Supabase in the future.

## Environment Variables

The following Supabase env vars are no longer needed:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Currently Used:**
- `VITE_API_URL` (defaults to `http://localhost:4000/api`)

## Testing

### Console Warnings Resolved
✅ Removed: `net::ERR_NAME_NOT_RESOLVED` errors from Supabase
✅ Removed: "Multiple GoTrueClient instances" warning
✅ Kept: React Router v7 upgrade notices (pre-deprecation warnings)
✅ Kept: React DevTools suggestion (optional browser extension)

### Expected Behavior
- ✅ HomePage: Loads categories and menu items from `/api/categories` and `/api/menu`
- ✅ MenuPage: Filters menu items by category (API powered)
- ✅ MealDetailsPage: Shows item details from API
- ⚠️ CheckoutPage: Requires order creation API endpoint
- ⚠️ OrdersPage: Requires orders API endpoint
- ⚠️ FavoritesPage: Requires favorites API endpoint
- ⚠️ AdminMenuSection: Disabled (requires backend implementation)

## Next Steps

To complete the migration, implement these API endpoints on your backend:

### Required Endpoints
```
GET    /api/categories              → List all categories
GET    /api/menu                    → List all menu items
POST   /api/orders                  → Create new order
GET    /api/orders/:id              → Get order details
GET    /api/users/:id/favorites     → Get favorite items
POST   /api/users/:id/favorites     → Add to favorites
DELETE /api/users/:id/favorites/:id → Remove from favorites
```

### Optional Endpoints (for admin)
```
POST   /api/menu                    → Create menu item
PUT    /api/menu/:id                → Update menu item
DELETE /api/menu/:id                → Delete menu item
POST   /api/categories              → Create category
PUT    /api/categories/:id          → Update category
DELETE /api/categories/:id          → Delete category
```

## Verification

All TypeScript compilation errors have been resolved:
```
✅ No compilation errors
✅ No missing imports
✅ All API calls use local endpoint
✅ Auth flow properly integrated
```

## Git Status

Files modified:
- `src/pages/HomePage.tsx`
- `src/pages/MenuPage.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/pages/OrderTrackingPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/pages/FavoritesPage.tsx`
- `src/pages/MealDetailsPage.tsx`
- `src/components/notifications/NotificationCenter.tsx`
- `src/components/admin/AdminMenuSection.tsx`
- `src/contexts/AuthContext.tsx`
- `src/lib/api.ts`

Files unchanged (can be deleted):
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/integrations/supabase/types-new.ts`

## Notes

1. **Notification System:** Real-time notifications (previously from Supabase) are disabled. Implement WebSocket/polling on backend if needed.

2. **Admin Section:** Storage file uploads (to Supabase Storage) are disabled. Implement backend file upload handling.

3. **Auth:** Simple local state auth. For production, implement proper JWT token rotation and refresh endpoints.

4. **Database:** The PostgreSQL database still exists and has all your data. The local Express API should connect to it for data persistence.
