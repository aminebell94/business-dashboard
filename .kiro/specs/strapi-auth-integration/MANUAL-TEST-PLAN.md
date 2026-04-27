# Manual Test Plan: Strapi Authentication Integration

## Overview

This document provides a comprehensive manual testing plan for the Strapi authentication integration. Since no automated testing framework is configured in this project, these manual tests should be executed to verify all authentication flows work correctly.

## Test Environment Setup

### Prerequisites
1. Strapi backend running and accessible
2. Test user accounts created in Strapi with different roles:
   - Valid user: `test@example.com` / `password123`
   - Admin user: `admin@example.com` / `admin123`
   - Invalid credentials for negative testing
3. Next.js development server running (`npm run dev`)
4. Browser with developer tools open (for inspecting localStorage and network requests)

### Test Data
- **Valid Email**: test@example.com
- **Valid Password**: password123
- **Invalid Email**: invalid@example.com
- **Invalid Password**: wrongpassword
- **Malformed Email**: notanemail

---

## Test Cases

### 1. Login with Valid Credentials

**Requirement**: 1.1, 1.2, 1.3, 1.4, 1.5

**Steps**:
1. Navigate to `/login`
2. Enter valid email: `test@example.com`
3. Enter valid password: `password123`
4. Click "Sign In" button

**Expected Results**:
- ✅ Form submits without validation errors
- ✅ Loading spinner appears on submit button
- ✅ POST request sent to `/api/strapi/auth/local`
- ✅ JWT token stored in localStorage (key: `auth_token`)
- ✅ User redirected to dashboard home page (`/`)
- ✅ User information visible in sidebar
- ✅ No error messages displayed

**Verification**:
- Open DevTools → Application → Local Storage → Check for `auth_token`
- Open DevTools → Network → Verify POST to `/api/strapi/auth/local` returns 200
- Verify user email/username appears in sidebar

---

### 2. Login with Invalid Credentials

**Requirement**: 1.6, 10.1

**Steps**:
1. Navigate to `/login`
2. Enter invalid email: `invalid@example.com`
3. Enter invalid password: `wrongpassword`
4. Click "Sign In" button

**Expected Results**:
- ✅ Form submits
- ✅ Loading spinner appears briefly
- ✅ Error toast notification appears: "Invalid email or password"
- ✅ User remains on login page
- ✅ No token stored in localStorage
- ✅ Form fields remain populated (email visible, password cleared for security)

**Verification**:
- Check for toast notification with error message
- Verify no `auth_token` in localStorage
- Verify Network tab shows 400/401 response from auth endpoint

---

### 3. Login Form Validation

**Requirement**: 1.7, 1.8, 8.3, 8.4

**Test 3a: Invalid Email Format**

**Steps**:
1. Navigate to `/login`
2. Enter malformed email: `notanemail`
3. Tab out of email field or click password field

**Expected Results**:
- ✅ Inline error message appears: "Invalid email address"
- ✅ Submit button remains enabled but form won't submit
- ✅ Error clears when valid email entered

**Test 3b: Empty Password**

**Steps**:
1. Navigate to `/login`
2. Enter valid email: `test@example.com`
3. Leave password field empty
4. Click "Sign In" button

**Expected Results**:
- ✅ Inline error message appears: "Password is required"
- ✅ Form does not submit
- ✅ No API request made

**Test 3c: Empty Email**

**Steps**:
1. Navigate to `/login`
2. Leave email field empty
3. Enter password: `password123`
4. Click "Sign In" button

**Expected Results**:
- ✅ Inline error message appears: "Invalid email address" or "Email is required"
- ✅ Form does not submit

---

### 4. Session Persistence Across Page Refresh

**Requirement**: 2.1, 2.2, 2.3, 2.4

**Steps**:
1. Log in with valid credentials (see Test 1)
2. Verify you're on the dashboard
3. Refresh the page (F5 or Ctrl+R)
4. Wait for page to reload

**Expected Results**:
- ✅ Brief loading state shown
- ✅ GET request sent to `/api/strapi/users/me` with Authorization header
- ✅ User remains authenticated
- ✅ Dashboard content loads normally
- ✅ User information still visible in sidebar
- ✅ No redirect to login page

**Verification**:
- Open DevTools → Network → Check for GET `/api/strapi/users/me` with `Authorization: Bearer <token>` header
- Verify response returns user data (200 status)
- Check localStorage still contains `auth_token`

---

### 5. Session Persistence Across Browser Tabs

**Requirement**: 2.1, 2.2, 2.4

**Steps**:
1. Log in with valid credentials in Tab 1
2. Open a new tab (Tab 2)
3. Navigate to dashboard URL (`http://localhost:3000`) in Tab 2

**Expected Results**:
- ✅ Tab 2 shows brief loading state
- ✅ Tab 2 loads dashboard without requiring login
- ✅ User information visible in both tabs
- ✅ Both tabs share the same session

**Verification**:
- Both tabs should show authenticated state
- localStorage `auth_token` is shared across tabs

---

### 6. Logout Clears Session

**Requirement**: 3.1, 3.2, 3.3, 3.4, 3.5

**Steps**:
1. Log in with valid credentials
2. Verify you're on the dashboard
3. Click the logout button in the sidebar
4. Wait for redirect

**Expected Results**:
- ✅ User redirected to `/login` page
- ✅ `auth_token` removed from localStorage
- ✅ User information no longer visible in sidebar
- ✅ Attempting to navigate to `/` redirects back to `/login`

**Verification**:
- Open DevTools → Application → Local Storage → Verify `auth_token` is deleted
- Try navigating to `/orders` → Should redirect to `/login`
- Check Network tab for cleared cache/queries

---

### 7. Protected Routes Redirect When Unauthenticated

**Requirement**: 4.1, 4.2, 4.3, 4.4

**Test 7a: Direct URL Access**

**Steps**:
1. Ensure you're logged out (clear localStorage if needed)
2. Navigate directly to `/orders` in the address bar

**Expected Results**:
- ✅ Brief loading state shown
- ✅ Automatic redirect to `/login?redirect=%2Forders`
- ✅ Login page displays
- ✅ Protected content never renders

**Test 7b: Post-Login Redirect**

**Steps**:
1. Follow Test 7a to get redirected to login with redirect parameter
2. Log in with valid credentials
3. Wait for redirect

**Expected Results**:
- ✅ After successful login, user redirected to originally requested URL (`/orders`)
- ✅ Orders page loads normally
- ✅ User is authenticated

**Test 7c: Multiple Protected Routes**

**Steps**:
1. Ensure you're logged out
2. Try accessing each protected route:
   - `/` (dashboard home)
   - `/orders`
   - `/orders/new`
   - `/products`
   - `/users`

**Expected Results**:
- ✅ All routes redirect to `/login` with appropriate redirect parameter
- ✅ No protected content visible before redirect

---

### 8. Role-Based Access Control

**Requirement**: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6

**Test 8a: Admin Role Access**

**Steps**:
1. Log in with admin user: `admin@example.com`
2. Navigate to pages with role-guarded content
3. Look for admin-only features (delete buttons, edit actions)

**Expected Results**:
- ✅ Admin user can see all features
- ✅ Role-guarded components render normally
- ✅ No "access denied" messages

**Test 8b: Regular User Role Restrictions**

**Steps**:
1. Log in with regular user: `test@example.com`
2. Navigate to pages with role-guarded content
3. Look for admin-only features

**Expected Results**:
- ✅ Regular user cannot see admin-only features
- ✅ Role-guarded components show access denied message or are hidden
- ✅ User can still access basic features

**Verification**:
- Check user object in DevTools → Components → AuthProvider → user.role
- Verify RoleGuard components render/hide appropriately

---

### 9. API Integration with Authorization Headers

**Requirement**: 7.1, 7.2, 7.3

**Steps**:
1. Log in with valid credentials
2. Navigate to `/orders` page
3. Open DevTools → Network tab
4. Observe API requests

**Expected Results**:
- ✅ All requests to `/api/strapi/*` include `Authorization: Bearer <token>` header
- ✅ Requests return 200 status (not 401)
- ✅ Data loads successfully

**Verification**:
- Click on any request to `/api/strapi/*` in Network tab
- Check Headers → Request Headers → Verify `Authorization` header present
- Verify token matches the one in localStorage

---

### 10. 401 Response Triggers Logout

**Requirement**: 7.3, 9.2, 9.3, 9.5, 12.1

**Steps**:
1. Log in with valid credentials
2. Open DevTools → Application → Local Storage
3. Manually modify the `auth_token` to an invalid value (e.g., `invalid_token_123`)
4. Navigate to `/orders` or refresh the page
5. Wait for API request

**Expected Results**:
- ✅ API request returns 401 Unauthorized
- ✅ Session automatically cleared
- ✅ User redirected to `/login`
- ✅ `auth_token` removed from localStorage
- ✅ Optional: Toast notification about session expiration

**Verification**:
- Network tab shows 401 response
- localStorage `auth_token` is cleared
- User is on `/login` page

---

### 11. Session Refresh on 401

**Requirement**: 9.1, 9.2, 9.3, 9.4, 9.5

**Steps**:
1. Log in with valid credentials
2. Wait for token to expire (or manually set an expired token)
3. Perform an action that triggers an API call
4. Observe behavior

**Expected Results**:
- ✅ First API call returns 401
- ✅ System attempts to refresh session by calling `/api/strapi/users/me`
- ✅ If refresh succeeds, original request retried
- ✅ If refresh fails, user logged out and redirected to login

**Note**: This test requires token expiration, which may need backend configuration or manual token manipulation.

---

### 12. Loading States

**Requirement**: 11.1, 11.2, 11.3, 11.4

**Test 12a: Initial Session Check**

**Steps**:
1. Have a valid token in localStorage
2. Refresh the page or open the app in a new tab
3. Observe the initial loading state

**Expected Results**:
- ✅ Brief loading spinner or skeleton shown
- ✅ "Checking authentication..." message (or similar)
- ✅ Content loads after authentication verified
- ✅ No flash of unauthenticated content

**Test 12b: Login Form Loading**

**Steps**:
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Sign In"
4. Observe button state

**Expected Results**:
- ✅ Submit button shows loading spinner
- ✅ Submit button is disabled during request
- ✅ Form fields remain visible but disabled
- ✅ Loading state clears after response

**Test 12c: Protected Route Loading**

**Steps**:
1. Log out
2. Navigate to a protected route like `/orders`
3. Observe loading behavior

**Expected Results**:
- ✅ Brief loading state shown while checking authentication
- ✅ No flash of protected content before redirect
- ✅ Smooth transition to login page

---

### 13. Error Handling

**Requirement**: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6

**Test 13a: Network Error**

**Steps**:
1. Stop the Strapi backend server
2. Navigate to `/login`
3. Enter valid credentials
4. Click "Sign In"

**Expected Results**:
- ✅ Error toast appears: "Unable to connect. Please try again"
- ✅ User remains on login page
- ✅ Form is re-enabled for retry
- ✅ No token stored

**Test 13b: Server Error (500)**

**Steps**:
1. Configure Strapi to return 500 error (or use network throttling/mock)
2. Attempt to log in

**Expected Results**:
- ✅ Error toast appears: "Server error. Please try again later"
- ✅ User remains on login page
- ✅ Error logged to console (without sensitive data)

**Test 13c: Malformed Response**

**Steps**:
1. Configure API to return malformed JSON (if possible)
2. Attempt to log in

**Expected Results**:
- ✅ Error toast appears with appropriate message
- ✅ Error logged to console
- ✅ Application doesn't crash

**Test 13d: Error Message Clearing**

**Steps**:
1. Trigger a login error (invalid credentials)
2. Observe error toast
3. Correct credentials and submit again

**Expected Results**:
- ✅ Previous error toast dismissed
- ✅ New attempt proceeds normally
- ✅ No stale error messages

---

### 14. Security Best Practices

**Requirement**: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6

**Test 14a: Password Masking**

**Steps**:
1. Navigate to `/login`
2. Enter password in password field
3. Observe field

**Expected Results**:
- ✅ Password characters are masked (dots or asterisks)
- ✅ Password not visible in plain text
- ✅ Optional: Password visibility toggle works if implemented

**Test 14b: No Sensitive Data in Console**

**Steps**:
1. Open DevTools → Console
2. Perform login with valid credentials
3. Perform login with invalid credentials
4. Perform logout
5. Review console logs

**Expected Results**:
- ✅ No passwords logged to console
- ✅ No JWT tokens logged to console
- ✅ Error messages don't include sensitive data
- ✅ Only safe debugging information logged

**Test 14c: Token Format Validation**

**Steps**:
1. Open DevTools → Application → Local Storage
2. Manually set `auth_token` to invalid format (e.g., `not-a-jwt`)
3. Refresh the page

**Expected Results**:
- ✅ Invalid token rejected
- ✅ Token cleared from localStorage
- ✅ User redirected to login
- ✅ No application crash

**Test 14d: Session Cleanup on Logout**

**Steps**:
1. Log in and use the application
2. Open DevTools → Application
3. Note all stored data (localStorage, sessionStorage, cookies)
4. Log out
5. Check storage again

**Expected Results**:
- ✅ `auth_token` removed from localStorage
- ✅ No user data remains in storage
- ✅ TanStack Query cache cleared
- ✅ Clean slate for next login

---

### 15. Cross-Browser Testing

**Requirement**: All

**Browsers to Test**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

**Test Cases**:
- Run Tests 1-14 in each browser
- Verify localStorage behavior is consistent
- Verify redirects work correctly
- Verify UI renders properly

**Expected Results**:
- ✅ All functionality works across browsers
- ✅ No browser-specific issues
- ✅ Consistent user experience

---

## Test Execution Checklist

Use this checklist to track test execution:

- [ ] 1. Login with Valid Credentials
- [ ] 2. Login with Invalid Credentials
- [ ] 3a. Login Form Validation - Invalid Email
- [ ] 3b. Login Form Validation - Empty Password
- [ ] 3c. Login Form Validation - Empty Email
- [ ] 4. Session Persistence Across Page Refresh
- [ ] 5. Session Persistence Across Browser Tabs
- [ ] 6. Logout Clears Session
- [ ] 7a. Protected Routes - Direct URL Access
- [ ] 7b. Protected Routes - Post-Login Redirect
- [ ] 7c. Protected Routes - Multiple Routes
- [ ] 8a. Role-Based Access Control - Admin
- [ ] 8b. Role-Based Access Control - Regular User
- [ ] 9. API Integration with Authorization Headers
- [ ] 10. 401 Response Triggers Logout
- [ ] 11. Session Refresh on 401
- [ ] 12a. Loading States - Initial Session Check
- [ ] 12b. Loading States - Login Form
- [ ] 12c. Loading States - Protected Route
- [ ] 13a. Error Handling - Network Error
- [ ] 13b. Error Handling - Server Error
- [ ] 13c. Error Handling - Malformed Response
- [ ] 13d. Error Handling - Error Clearing
- [ ] 14a. Security - Password Masking
- [ ] 14b. Security - No Sensitive Data in Console
- [ ] 14c. Security - Token Format Validation
- [ ] 14d. Security - Session Cleanup
- [ ] 15. Cross-Browser Testing

---

## Test Results Summary

**Date**: _________________  
**Tester**: _________________  
**Environment**: _________________

**Total Tests**: 30  
**Passed**: _____  
**Failed**: _____  
**Blocked**: _____  

**Critical Issues Found**:
- 

**Notes**:
- 

---

## Automated Testing Recommendations

For future improvements, consider adding:

1. **Unit Tests** (Jest + React Testing Library):
   - AuthProvider component tests
   - LoginForm component tests
   - ProtectedRoute component tests
   - RoleGuard component tests
   - API layer function tests

2. **Integration Tests** (Playwright or Cypress):
   - Full login-to-dashboard flow
   - Session persistence scenarios
   - Protected route access patterns
   - Role-based access control flows

3. **E2E Tests**:
   - Complete user journeys
   - Cross-browser compatibility
   - Performance testing

**Setup Commands** (for future reference):
```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Install E2E testing
npm install -D @playwright/test
# or
npm install -D cypress
```
