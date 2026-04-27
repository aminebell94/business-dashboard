# Manual Test Plan for Session Refresh on 401

## Test Scenario 1: Valid Token with Temporary 401
**Setup**: User is logged in with a valid token, but receives a 401 from an API endpoint (e.g., due to temporary server issue)

**Expected Behavior**:
1. `authenticatedFetch()` receives 401 response
2. System attempts session refresh by calling `/api/strapi/users/me`
3. If refresh succeeds (token is still valid), original request is retried
4. User continues working without interruption

**Test Steps**:
1. Log in to the application
2. Simulate a 401 response from an API endpoint
3. Verify that the session refresh is attempted
4. Verify that the original request is retried
5. Verify that the user remains logged in

## Test Scenario 2: Expired Token
**Setup**: User's JWT token has expired

**Expected Behavior**:
1. `authenticatedFetch()` receives 401 response
2. System attempts session refresh by calling `/api/strapi/users/me`
3. Refresh fails (returns 401)
4. Token is cleared from localStorage
5. AuthProvider detects missing token and redirects to login

**Test Steps**:
1. Log in to the application
2. Wait for token to expire or manually expire it
3. Make an API request
4. Verify that session refresh is attempted
5. Verify that token is cleared
6. Verify that user is redirected to login page

## Test Scenario 3: Auth Endpoint 401 (No Infinite Loop)
**Setup**: User attempts to log in with invalid credentials

**Expected Behavior**:
1. Login request to `/api/strapi/auth/local` returns 401
2. System does NOT attempt session refresh (to avoid infinite loop)
3. Token is cleared
4. Error is displayed to user

**Test Steps**:
1. Attempt to log in with invalid credentials
2. Verify that 401 is received
3. Verify that NO session refresh is attempted
4. Verify that error message is displayed

## Implementation Details

The enhanced `authenticatedFetch()` function now:
- Detects 401 responses
- Checks if the request is to an auth endpoint (to avoid infinite loops)
- If not an auth endpoint and token exists, attempts refresh via `/api/strapi/users/me`
- If refresh succeeds, retries the original request
- If refresh fails, clears the token
- Lets AuthProvider handle the redirect to login
