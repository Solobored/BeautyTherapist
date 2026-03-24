# Hydration Mismatch Fixes - Summary

## Issue

The application was experiencing a hydration mismatch error:

```
A tree hydrated but some attributes of the server rendered HTML didn't match
the client properties.
```

Root cause: Browser extensions (like Grammarly) were adding attributes (`data-new-gr-c-s-check-loaded`, `data-gr-ext-installed`) to the `<body>` element that React couldn't account for during hydration.

## Solutions Implemented

### 1. Layout Component (`app/layout.tsx`)

**Problem:** `<body>` tag attributes not suppressed, causing hydration warnings.

**Fix:**

```typescript
// Before
<html lang="es" suppressHydrationWarning>
  <body className={`...`}>

// After
<html lang="es" suppressHydrationWarning={true}>
  <body suppressHydrationWarning={true} className={`...`}>
```

**Impact:** Suppresses hydration warnings for unknown attributes added by browser extensions.

### 2. Auth Context (`contexts/auth-context.tsx`)

**Problems:**

- Math.random() calls during state initialization causing different values on server vs client
- Missing register() method in context interface
- Contexts rendering before hydration complete

**Fixes:**

```typescript
// Added hydration guard
if (!isHydrated) {
  return <>{children}</>
}

// Added generateId helper to handle Math.random() safely
const generateId = (prefix: string) => {
  if (typeof window === 'undefined') return `${prefix}-temp`
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

// Added missing register() method to interface
const register = async (email: string, password: string, type: 'buyer' | 'seller', data?: any) => {
  if (type === 'buyer') {
    return await registerBuyer({ email, password, ...data })
  } else {
    return await registerSeller({ email, password, ...data })
  }
}
```

**Impact:**

- Prevents Math.random() from being called on server during render
- Ensures context value only provided to children after client hydration
- Fixes TypeScript interface mismatch

### 3. Cart Context (`contexts/cart-context.tsx`)

**Problem:** Context providing values before hydration, causing localStorage mismatches.

**Fix:**

```typescript
// Added hydration guard
if (!isHydrated) {
  return <>{children}</>
}

return (
  <CartContext.Provider value={{...}}>
    {children}
  </CartContext.Provider>
)
```

**Impact:** Prevents rendering context with stale localStorage values on server render.

### 4. Coupons Page (`app/account/coupons/page.tsx`)

**Problem:** Date.now() calculations during render produce different results on server vs client.

**Fix:**

```typescript
// Added isHydrated state
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

// Wrapped getDaysUntilExpiry in useMemo
const daysLeft = useMemo(
  () => getDaysUntilExpiry(coupon.expiryDate),
  [coupon.expiryDate],
);

// Early return until hydrated
if (!user || user.type !== "buyer" || !isHydrated) {
  return null;
}
```

**Impact:** Ensures date calculations only happen on client after hydration.

### 5. Sidebar Skeleton (`components/ui/sidebar.tsx`)

**Problem:** Math.random() in useMemo still renders different values on server vs client initially.

**Fix:**

```typescript
const [isHydrated, setIsHydrated] = React.useState(false);

React.useEffect(() => {
  setIsHydrated(true);
}, []);

// Return stable default until hydrated
const width = React.useMemo(() => {
  if (!isHydrated) return "50%";
  return `${Math.floor(Math.random() * 40) + 50}%`;
}, [isHydrated]);
```

**Impact:** Returns stable value during server render, then generates random value on client.

## How Hydration Mismatch Works

1. **Server Render:** Next.js renders your app on the server, creating HTML
2. **Client Render:** React renders your component in the browser
3. **Hydration:** React compares client-rendered output with server HTML
4. **Mismatch:** If they differ, React logs a warning and re-renders

### Common Causes:

- ✅ **Math.random()** - Different value each time
- ✅ **Date.now()** - Passes time between server and client
- ✅ **Browser extensions** - Modify HTML after React loads
- ✅ **localStorage** - Not available on server
- ✅ **window.matchMedia** - Browser-only API
- ✅ **typeof window** - Always undefined on server

## Best Practices for Prevention

### Use Hydration Guard Pattern

```typescript
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

// Return null or fallback until hydrated
if (!isHydrated) return null;
```

### Avoid These in Render:

```javascript
// ❌ Bad
<span>{Math.random()}</span>
<span>{Date.now()}</span>
<span>{new Date().toLocaleString()}</span>

// ✅ Good - Use in effects or events
useEffect(() => {
  setRandomValue(Math.random())
}, [])

const handleClick = () => {
  generateId(Date.now())
}
```

### Use suppressHydrationWarning for Dynamic Content

```typescript
// When you know content will differ
<div suppressHydrationWarning>
  {variableContent}
</div>
```

## Testing Hydration Issues

### Enable Debug Mode

```typescript
// pages/api/debug.ts
if (process.env.NODE_ENV === "development") {
  import("react").then((React) => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.("Hydration mismatch")) {
        console.log("HYDRATION DEBUG:", args);
      }
      originalError(...args);
    };
  });
}
```

### Test Build Locally

```bash
npm run build
npm start
# Visit page and check browser console for hydration warnings
```

### Hard Refresh

```
Chrome/Edge: Ctrl+Shift+R
Safari: Cmd+Shift+R
Firefox: Ctrl+Shift+F5
```

## Verifying Fixes

1. **Local Testing:**

```bash
npm run build
npm start
# Check browser console - should see no hydration warnings
```

2. **Vercel Deployment:**

- Check deployment logs for hydration errors
- Open DevTools (F12) → Console tab
- Navigate through app - should be no orange/red errors

3. **Performance:**

- App should not flicker or jump on initial load
- Page should be interactive immediately
- Smooth transitions between components

## Related Issue with Browser Extensions

The specific error mentioning `data-new-gr-c-s-check-loaded` and `data-gr-ext-installed` is caused by:

### Grammarly Extension

Adding attributes to track spelling/grammar checking

**Fix:**  
Suppressing on `<html>` and `<body>` tags signals to React to ignore unknown attributes.

### User Solution:

1. Try disabling browser extensions temporarily
2. Test in incognito/private window (extensions disabled by default)
3. If issue persists, check console for other hydration errors

## Performance Impact

These fixes have **no negative performance impact**:

- Early returns during hydration prevent unnecessary renders
- useMemo ensures stable values across renders
- hydration guards only add minimal state overhead
- No additional network requests

## Deployment Considerations

When deploying to Vercel:

1. **Next.js caching:** Vercel caches builds, ensure consistent behavior
2. **Environment variables:** Set in Vercel dashboard, not in code
3. **ISR/SSG:** Use these for static content when possible
4. **API routes:** Handled on Vercel serverless functions
5. **Image optimization:** Vercel auto-optimizes next/image

## Resources

- React Hydration: https://react.dev/reference/react-dom/hydrate
- Next.js SSR: https://nextjs.org/docs/basic-features/server-side-rendering
- Vercel Best Practices: https://vercel.com/docs/best-practices

---

**All hydration issues have been fixed and tested.**  
**Application is ready for local development and production deployment.**
