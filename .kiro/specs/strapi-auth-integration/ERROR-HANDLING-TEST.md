# Error Handling Test Guide

This document provides manual testing steps to verify the enhanced error handling for edge cases in the authentication system.

## Test Cases

### 1. Network Error During Login

**Scenario**: Simulate network failure during login attempt

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Navigate to `/login`
5. Enter valid credentials
6. Click "Sign In"

**Expected Results**:
- Toast notification appears: "Connection Error - Unable to connect. Please try again"
- Console logs: `Network error during login: [error message]`
- No sensitive data (password) in console logs
- Form remains enabled for retry
- User stays on login page

**Implemented**: ✅
- `loginUser()` catches `TypeError` with 'fetch' in message
- Throws user-friendly error: "Unable to connect to server. Please check your network connection."
- AuthProvider maps this to "Connection Error" toast

---

### 2. Token Expiration During Session

**Scenario**: Token expires while user is using the application

**Steps**:
1. Log in successfully
2. Manually expire the token in localStorage (or wait for natural expiration)
3. Navigate to any protected page (e.g., `/orders`)
4. Trigger an API call (e.g., refresh the page)

**Expected Results**:
- Console logs: `Token expired or invalid, clearing session`
- User is redirected to `/login`
- No error toast shown (natural session expiration)
- All cached data is cleared
- No sensitive data in console logs

**Implemented**: ✅
- `getCurrentUser()` detects 401 status
- Logs: "Token expired or invalid, clearing session"
- Clears token and throws: "Session expired. Please log in again."
- `authenticatedFetch()` attempts refresh, then clears token on failure
- AuthProvider's `refreshSession()` handles gracefully without intrusive toasts

---

### 3. Malformed Response from Strapi (Login)

**Scenario**: Strapi returns invalid JSON during login

**Steps**:
1. Mock the `/api/strapi/auth/local` endpoint to return invalid JSON
2. Navigate to `/login`
3. Enter credentials and submit

**Expected Results**:
- Toast notification: "Login Failed - Received malformed response from server"
- Console logs: `Failed to parse login response: [error]`
- Token is cleared (if any existed)
- No sensitive data in console logs
- Form remains enabled for retry

**Implemented**: ✅
- `loginUser()` has try-catch around `response.json()`
- Catches parse errors and logs: "Failed to parse login response"
- Throws: "Received malformed response from server"
- AuthProvider maps to "Server Error" toast with appropriate message

---

### 4. Malformed Response from Strapi (User Data)

**Scenario**: Strapi returns invalid JSON when fetching user data

**Steps**:
1. Mock the `/api/strapi/users/me` endpoint to return invalid JSON
2. Have a valid token in localStorage
3. Refresh the page (triggers session initialization)

**Expected Results**:
- Console logs: `Failed to parse user data response: [error]`
- Token is cleared from localStorage
- User is not authenticated
- Redirected to login page naturally
- No error toast on initial load
- No sensitive data in console logs

**Implemented**: ✅
- `getCurrentUser()` has try-catch around `response.json()`
- Catches parse errors and logs: "Failed to parse user data response"
- Throws: "Received malformed response from server"
- Clears token automatically
- AuthProvider's `initializeSession()` handles gracefully

---

### 5. Invalid Response Structure (Missing Fields)

**Scenario**: Strapi returns 200 OK but response is missing required fields

**Steps**:
1. Mock `/api/strapi/auth/local` to return `{ "jwt": "token" }` (missing user)
2. Attempt to log in

**Expected Results**:
- Toast notification: "Login Failed - Invalid response format from authentication server"
- Console logs: `Login response missing required fields: { hasJwt: true, hasUser: false }`
- Token is not stored
- No sensitive data in console logs
- Form remains enabled for retry

**Implemented**: ✅
- `loginUser()` validates response structure
- Checks for both `data.jwt` and `data.user`
- Logs missing fields for debugging
- Throws: "Invalid response format from authentication server"

---

### 6. Server Error (500) During Login

**Scenario**: Strapi returns 500 Internal Server Error

**Steps**:
1. Mock `/api/strapi/auth/local` to return 500 status
2. Attempt to log in

**Expected Results**:
- Toast notification: "Server Error - Server error. Please try again later"
- Console logs: `Login failed: { status: 500, statusText: 'Internal Server Error', message: '...' }`
- Token is cleared
- No sensitive data in console logs
- Form remains enabled for retry

**Implemented**: ✅
- `loginUser()` handles non-OK responses
- Attempts to parse error message from response
- Logs error details without sensitive data
- AuthProvider maps 500 errors to "Server Error" toast

---

### 7. Network Error During Session Refresh

**Scenario**: Network fails during automatic session refresh (401 retry)

**Steps**:
1. Log in successfully
2. Enable offline mode in DevTools
3. Make an API call that triggers 401 handling
4. `authenticatedFetch()` attempts to refresh session

**Expected Results**:
- Console logs: `Session refresh error: [error message]`
- Token is cleared
- User is redirected to login
- No crash or unhandled promise rejection
- No sensitive data in console logs

**Implemented**: ✅
- `authenticatedFetch()` has try-catch around refresh attempt
- Catches network errors during refresh
- Logs: "Session refresh error: [message]"
- Clears token and returns original 401 response
- AuthProvider handles redirect

---

### 8. Invalid Token Format in localStorage

**Scenario**: localStorage contains malformed token

**Steps**:
1. Manually set invalid token in localStorage: `localStorage.setItem('auth_token', 'invalid-token')`
2. Refresh the page

**Expected Results**:
- Console logs: `Invalid token format found in storage, clearing...`
- Token is cleared from localStorage
- User is not authenticated
- Redirected to login page naturally
- No error toast
- No sensitive data in console logs

**Implemented**: ✅
- `getAuthToken()` validates token format (3 parts separated by dots)
- Logs warning and clears invalid tokens
- Returns `null` for invalid tokens
- AuthProvider handles gracefully in `initializeSession()`

---

## Console Logging Verification

All error logging follows these rules:
- ✅ No passwords logged
- ✅ No JWT tokens logged
- ✅ Email addresses logged only for debugging (not sensitive)
- ✅ Error messages are descriptive
- ✅ Structured logging with context objects
- ✅ Appropriate log levels (error, warn)

## Error Message Mapping

| Error Type | User-Facing Message | Console Log |
|------------|-------------------|-------------|
| Network error | "Unable to connect. Please try again" | "Network error during login: [message]" |
| Invalid credentials | "Invalid email or password" | "Login failed: { status: 401, ... }" |
| Token expired | "Session expired. Please log in again." | "Token expired or invalid, clearing session" |
| Malformed response | "Received invalid response from server" | "Failed to parse [type] response: [error]" |
| Server error (500) | "Server error. Please try again later" | "Login failed: { status: 500, ... }" |
| Missing fields | "Invalid response format from authentication server" | "Login response missing required fields: {...}" |

## Summary

All edge cases are handled with:
1. ✅ User-friendly error messages via toast notifications
2. ✅ Detailed console logging for debugging
3. ✅ No sensitive data in logs
4. ✅ Graceful degradation (clear state, allow retry)
5. ✅ Proper error propagation
6. ✅ Network error detection and handling
7. ✅ Token validation and expiration handling
8. ✅ Malformed response detection
