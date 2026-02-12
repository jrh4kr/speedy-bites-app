# Authentication & Security Implementation Guide

## Overview
This document outlines the complete authentication system, cart management, checkout process, and security features implemented in the Speedy Bites app.

## Table of Contents
1. [Authentication System](#authentication-system)
2. [Security Features](#security-features)
3. [Cart Management](#cart-management)
4. [Checkout Process](#checkout-process)
5. [Backend Requirements](#backend-requirements)
6. [Testing Checklist](#testing-checklist)

---

## Authentication System

### Architecture
The authentication system uses JWT (JSON Web Token) with refresh token rotation:

```
Login/SignUp → Backend validates → Issues JWT + Refresh Token
   ↓
Store in localStorage (with security warnings)
   ↓
Attach JWT to all API requests (Authorization: Bearer <token>)
   ↓
Token expires → Use Refresh Token to get new JWT
   ↓
Logout → Clear all tokens and user data
```

### Implementation Details

#### Login Flow
```typescript
login(email, password)
  ├─ Validate email format
  ├─ Validate password not empty
  ├─ Check rate limit (5 attempts per 15 minutes)
  ├─ Call API /auth/login
  ├─ Store JWT token
  ├─ Store user data
  └─ Redirect to home or previous page
```

#### Sign Up Flow
```typescript
signUp(email, password, name)
  ├─ Validate email format
  ├─ Validate password strength:
  │  ├─ Minimum 8 characters
  │  ├─ At least 1 uppercase letter
  │  ├─ At least 1 lowercase letter
  │  ├─ At least 1 number
  │  └─ At least 1 special character (!@#$%^&*)
  ├─ Validate name not empty
  ├─ Call API /auth/register
  ├─ Store JWT token
  ├─ Store user data
  └─ Redirect to home or profile setup
```

#### Token Management
- **JWT Storage**: localStorage with 'speedy_bites_auth_token' key
- **Expiry Check**: Every minute, tokens are checked for expiry
- **Auto Refresh**: If token expires within 5 minutes, refresh automatically
- **Manual Refresh**: Call `auth.refreshToken()` for explicit refresh
- **Cleanup**: On logout, all tokens and user data are cleared

### Key Files
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/lib/api.ts` - API calls for auth endpoints
- `src/lib/security.ts` - Security utilities and validators

---

## Security Features

### 1. Input Validation

#### Email Validation
```typescript
validateEmail(email: string): boolean
- Checks email format with regex
- Max length: 255 characters
```

#### Password Validation
```typescript
validatePassword(password: string): { valid: boolean; errors: string[] }
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)
```

#### Phone Number Validation
```typescript
validatePhoneNumber(phone: string): boolean
- Accepts Kenyan numbers
- Formats: +254XXXXXXXXX, 0XXXXXXXXX, 254XXXXXXXXX
```

### 2. Rate Limiting

```typescript
const loginRateLimiter = new RateLimiter()
- Max 5 login attempts per email
- 15-minute reset window
- Prevents brute force attacks
```

**Usage:**
```typescript
if (!loginRateLimiter.check(`login_${email}`)) {
  // Too many attempts
}
```

### 3. Token Security

#### JWT Validation
```typescript
isTokenExpired(token: string): boolean
- Decodes token without verification
- Checks exp claim
- Returns true if expired
```

#### Token Expiry Detection
```typescript
getTokenExpiry(token: string): number | null
- Returns expiry timestamp in milliseconds
- Used for auto-refresh scheduling
```

### 4. Input Sanitization

```typescript
sanitizeInput(input: string): string
- Removes XSS attack vectors (<, >, ", ')
- Max length: 500 characters
- Trims whitespace
```

### 5. Secure Local Storage

```typescript
getSecureItem(key: string): string | null
setSecureItem(key: string, value: string): void
removeSecureItem(key: string): void
clearAllSecureItems(): void
```

All keys are prefixed with 'speedy_bites_' to prevent conflicts.

### 6. CORS & Security Headers

**Frontend sends:**
```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Authorization': 'Bearer <token>'
}
```

**Backend should send:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Cart Management

### Cart Structure
```typescript
interface Cart {
  items: CartItem[];
  subtotal: number;      // Sum of (price × quantity) for all items
  deliveryFee: number;   // 0 if subtotal >= 1000 KES, else 150 KES
  discount: number;      // Applied promo code discount
  total: number;         // subtotal + deliveryFee - discount
  promoCode?: string;    // Applied promo code
}
```

### Cart Item
```typescript
interface CartItem {
  id: string;            // Unique identifier (item-id + timestamp)
  menuItem: MenuItem;    // Product details
  quantity: number;      // Item quantity
  totalPrice: number;    // price × quantity
  options?: CartItemOptions;  // Special instructions
}
```

### Key Features

#### Proper Calculation Logic
```typescript
// Subtotal: Sum of all items
subtotal = items.reduce((sum, item) => sum + (item.price × item.quantity), 0)

// Delivery Fee
if (subtotal >= 1000 KES) {
  deliveryFee = 0  // Free delivery
} else {
  deliveryFee = 150 KES
}

// Total
total = max(0, subtotal + deliveryFee - discount)
```

#### Duplicate Item Handling
When adding an item that already exists in the cart (same product, same options):
- Increase quantity instead of creating duplicate
- Recalculate totalPrice for that item

#### Persistence
- Cart is automatically saved to localStorage
- Cart persists across browser sessions
- Cart is restored when user returns

### API Methods

```typescript
// Add item
addItem(item: MenuItem, quantity?: number, options?: CartItemOptions)

// Update quantity
updateQuantity(cartItemId: string, quantity: number)
// If quantity = 0, item is removed

// Remove item
removeItem(cartItemId: string)

// Clear all items
clearCart()

// Apply promo code
applyPromo(code: string): Promise<{ success, discount?, error? }>

// Remove promo code
removePromo()
```

---

## Checkout Process

### Step-by-Step Flow

```
1. User clicks "Place Order"
   ├─ Validate user is logged in
   ├─ Validate cart not empty
   └─ Validate delivery address filled

2. Prepare order payload
   ├─ Customer ID (from auth)
   ├─ Cart subtotal, delivery fee, discount
   ├─ Item list with details
   ├─ Delivery address
   ├─ Special instructions
   ├─ Payment method (M-Pesa / Cash)
   └─ Applied promo code

3. Send to backend POST /orders
   ├─ Backend validates all data
   ├─ Creates order in database
   ├─ Creates order items
   ├─ Handles promo code redemption
   └─ Returns order ID

4. Success
   ├─ Clear cart
   ├─ Show success message
   └─ Redirect to order tracking page
```

### Order Payload Structure

```typescript
{
  customer_id: string,
  subtotal: number,
  delivery_fee: number,
  discount: number,
  total: number,
  delivery_address: {
    street: string,
    city: string,
    landmark?: string | null
  },
  notes?: string | null,
  payment_method: 'mpesa' | 'cash',
  items: [{
    menu_item_id: string,
    name: string,
    quantity: number,
    unit_price: number,
    total_price: number,
    notes?: string | null
  }],
  promo_code?: string | null
}
```

### Error Handling

```typescript
Validation Errors:
- Not logged in → Redirect to login
- Empty address → Show toast "Enter delivery address"
- Empty cart → Show toast "Cart is empty"
- Invalid data → Show specific error message

API Errors:
- Network error → Show "Failed to place order"
- 400 Bad Request → Show backend error message
- 401 Unauthorized → Redirect to login
- 500 Server Error → Show "Server error, try again"
```

### Post-Checkout

1. **Cart Cleared**: localStorage cart removed
2. **Order Tracking**: User redirected to `/orders/{orderId}`
3. **Notifications**: Toast notification sent
4. **History**: Order added to user's order history

---

## Backend Requirements

### Required Endpoints

#### Authentication
```
POST /auth/login
  Body: { email, password }
  Response: { token, user }

POST /auth/register
  Body: { email, password, name }
  Response: { token, user }

POST /auth/refresh
  Body: { refresh_token }
  Response: { token }

POST /auth/logout
  Response: { success }
```

#### Menu
```
GET /api/categories
  Response: [{ id, name, image_url, item_count }]

GET /api/menu
  Response: [{ id, name, description, price, image_url, category_id, is_available, is_featured }]

GET /api/menu?category={id}
  Response: [{ ... }] (filtered)
```

#### Orders
```
POST /api/orders
  Headers: { Authorization: Bearer <token> }
  Body: { customer_id, items, delivery_address, ... }
  Response: { id, status, total }

GET /api/orders/{id}
  Headers: { Authorization: Bearer <token> }
  Response: { order details with items, rider info }

GET /api/users/{id}/orders
  Headers: { Authorization: Bearer <token> }
  Response: [{ order summary }]
```

#### Promo Codes
```
POST /api/promo/validate
  Body: { code, subtotal }
  Response: { code, discount_amount, discount_type }
```

### Security Requirements on Backend

1. **Input Validation**: Validate all inputs server-side
2. **Rate Limiting**: Limit login attempts per IP/email
3. **Password Hashing**: Use bcrypt or similar
4. **JWT**: Use HS256 or RS256 algorithm
5. **HTTPS**: Only accept HTTPS in production
6. **CORS**: Configure for your domain only
7. **Refresh Tokens**: Store in httpOnly cookies or secure storage
8. **Token Expiry**: Access tokens: 15-30 minutes, Refresh tokens: 7-30 days

---

## Testing Checklist

### Authentication
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Sign up with weak password shows requirements
- [ ] Sign up creates user and logs them in
- [ ] Logout clears user and tokens
- [ ] Token expiry triggers auto-refresh
- [ ] Expired token redirects to login
- [ ] Rate limiting blocks repeated failed attempts

### Cart
- [ ] Add item to cart increases quantity
- [ ] Add duplicate item increases existing quantity
- [ ] Update quantity works correctly
- [ ] Remove item deletes from cart
- [ ] Clear cart empties all items
- [ ] Subtotal calculated correctly
- [ ] Delivery fee: 150 KES for orders < 1000 KES
- [ ] Delivery fee: 0 for orders >= 1000 KES
- [ ] Total = subtotal + delivery fee - discount
- [ ] Cart persists after page refresh

### Checkout
- [ ] Checkout blocked if not logged in
- [ ] Checkout blocked if address empty
- [ ] Checkout blocked if cart empty
- [ ] Order created successfully
- [ ] Cart cleared after checkout
- [ ] Order tracking page shows order details
- [ ] Multiple orders show in order history
- [ ] Promo code applied correctly
- [ ] Discount calculated in total

### Security
- [ ] Email validation rejects invalid format
- [ ] Password validation enforces requirements
- [ ] Phone number validation works for Kenya numbers
- [ ] XSS attempt in input is sanitized
- [ ] JWT token sent in Authorization header
- [ ] Unauthorized requests return 401
- [ ] Sensitive data not logged to console (production)
- [ ] localStorage not accessible from other origins

### Categories & Menu
- [ ] Categories display with correct item counts
- [ ] Filtering by category works
- [ ] All menu items load from API
- [ ] Item details display correctly
- [ ] Images load properly
- [ ] Prices formatted correctly

---

## Deployment Checklist

Before deploying to production:

1. **Environment Variables**
   - [ ] VITE_API_URL set to production API
   - [ ] All sensitive data in backend .env file
   - [ ] No hardcoded credentials in code

2. **Security**
   - [ ] HTTPS enabled
   - [ ] Security headers configured
   - [ ] CORS configured for your domain only
   - [ ] Rate limiting enabled on backend
   - [ ] Input validation on backend
   - [ ] Output encoding enabled

3. **Performance**
   - [ ] Lazy load components
   - [ ] Image optimization
   - [ ] API caching where appropriate
   - [ ] Cart localStorage size reasonable

4. **Monitoring**
   - [ ] Error logging configured
   - [ ] API response times tracked
   - [ ] Authentication failures logged
   - [ ] Failed transactions recorded

5. **Testing**
   - [ ] All checklist items passing
   - [ ] Cross-browser testing complete
   - [ ] Mobile responsiveness verified
   - [ ] Load testing done
   - [ ] Security audit performed

---

## Common Issues & Solutions

### Issue: Token keeps expiring
**Solution**: Ensure backend refresh token endpoint is working and frontend is calling it

### Issue: Cart not persisting
**Solution**: Check localStorage isn't disabled, verify key name matches

### Issue: Checkout fails silently
**Solution**: Check browser console for API errors, verify order payload structure

### Issue: Login rate limiting too strict
**Solution**: Adjust window or attempt limits in `src/lib/security.ts`

### Issue: CORS errors on checkout
**Solution**: Configure CORS on backend to include POST /orders endpoint
