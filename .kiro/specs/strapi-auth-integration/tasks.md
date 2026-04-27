# Implementation Plan: Strapi Authentication Integration

## Overview

This implementation plan breaks down the Strapi authentication integration into discrete, incremental tasks. Each task builds on previous work, starting with foundational types and API layer enhancements, then building up the authentication context, UI components, and finally integrating route protection and role-based access control.

The implementation follows the existing codebase patterns: TypeScript with strict typing, React Hook Form with Zod validation, TanStack Query for data fetching, and the established API layer structure in `lib/api.ts`.

## Tasks

- [x] 1. Set up authentication types and data models
  - Create TypeScript interfaces for User, UserRole, AuthResponse, LoginCredentials, and error types
  - Define Zod schemas for login form validation
  - Add types to `lib/types.ts` following existing patterns
  - _Requirements: 1.1, 1.7, 1.8, 8.2, 8.3_

- [x] 2. Enhance API layer with authentication capabilities
  - [x] 2.1 Implement token storage functions
    - Add `getAuthToken()`, `setAuthToken()`, and `clearAuthToken()` functions
    - Use localStorage with key 'auth_token'
    - Add token format validation
    - _Requirements: 2.1, 2.6, 12.5_
  
  - [x] 2.2 Create authentication API functions
    - Implement `loginUser(email, password)` calling `/api/strapi/auth/local`
    - Implement `getCurrentUser()` calling `/api/strapi/users/me`
    - Implement `logoutUser()` to clear token
    - Follow existing error handling patterns with `asJson()`
    - _Requirements: 1.2, 2.3, 3.2, 7.4_
  
  - [x] 2.3 Create authenticated fetch wrapper
    - Implement `authenticatedFetch()` that adds Authorization header
    - Include JWT token from `getAuthToken()` in Bearer format
    - Handle 401 responses by clearing token
    - _Requirements: 2.6, 7.1, 7.2, 7.3_
  
  - [x] 2.4 Update existing API functions to use authenticated fetch
    - Replace `fetchWithRetry` calls with `authenticatedFetch` in all API functions
    - Ensure backward compatibility for unauthenticated requests
    - _Requirements: 7.1, 7.5_

- [x] 3. Checkpoint - Verify API layer enhancements
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create authentication context and provider
  - [x] 4.1 Create AuthContext
    - Define `AuthContextValue` interface with user, isLoading, isAuthenticated, login, logout, refreshSession
    - Create React context in `lib/contexts/auth-context.ts`
    - Export `useAuth()` hook for consuming components
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 4.2 Implement AuthProvider component
    - Create `components/providers/auth-provider.tsx` with client directive
    - Manage authentication state (user, isLoading)
    - Implement session initialization on mount
    - Check localStorage for existing token and verify with `getCurrentUser()`
    - _Requirements: 2.2, 2.3, 2.4, 6.1, 11.1_
  
  - [x] 4.3 Implement login method
    - Call `loginUser()` API function
    - Store JWT token using `setAuthToken()`
    - Update context state with user data
    - Handle errors and display toast notifications
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 4.4 Implement logout method
    - Clear token using `clearAuthToken()`
    - Clear user state in context
    - Invalidate TanStack Query cache
    - Redirect to login page
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 12.4_
  
  - [x] 4.5 Implement session refresh method
    - Call `getCurrentUser()` to verify token
    - Update user state if valid
    - Clear session and redirect if invalid
    - _Requirements: 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 4.6 Write unit tests for AuthProvider
    - Test login flow with successful and failed authentication
    - Test logout clears state correctly
    - Test session restoration on mount
    - Test 401 handling triggers logout
    - _Requirements: 1.2, 1.6, 3.2, 7.3_

- [x] 5. Integrate AuthProvider into application
  - Add AuthProvider to `app/providers.tsx` wrapping existing providers
  - Ensure proper provider nesting order (Theme → ReactQuery → Auth)
  - _Requirements: 6.1_

- [x] 6. Create login form component
  - [x] 6.1 Build LoginForm component
    - Create `components/auth/login-form.tsx` with client directive
    - Use React Hook Form with Zod schema validation
    - Add email and password input fields using shadcn/ui components
    - Implement form submission calling `login()` from useAuth
    - Display loading state on submit button during authentication
    - Show validation errors inline
    - _Requirements: 1.1, 1.7, 1.8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.2, 11.5, 12.3_
  
  - [x] 6.2 Handle authentication errors in form
    - Display error messages using toast notifications
    - Map Strapi error responses to user-friendly messages
    - Clear errors on new submission attempt
    - _Requirements: 1.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 6.3 Write unit tests for LoginForm
    - Test form validation for email and password
    - Test successful login flow
    - Test error display for failed login
    - Test loading state during submission
    - _Requirements: 1.7, 1.8, 8.3, 8.4_

- [x] 7. Create login page
  - Create `app/login/page.tsx` as a public route
  - Render LoginForm component
  - Handle redirect query parameter for post-login navigation
  - Redirect to dashboard if already authenticated
  - Style page with centered card layout using shadcn/ui
  - _Requirements: 1.5, 4.3, 4.4_

- [x] 8. Checkpoint - Test login and logout flows
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement route protection
  - [x] 9.1 Create ProtectedRoute component
    - Create `components/auth/protected-route.tsx` with client directive
    - Check `isAuthenticated` from useAuth hook
    - Show loading fallback while `isLoading` is true
    - Redirect to `/login?redirect={currentPath}` if not authenticated
    - Render children if authenticated
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 11.3_
  
  - [x] 9.2 Wrap dashboard pages with ProtectedRoute
    - Update `app/page.tsx` (dashboard home)
    - Update `app/orders/page.tsx` and `app/orders/[id]/page.tsx`
    - Update `app/products/page.tsx`
    - Update `app/users/page.tsx`
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 9.3 Write unit tests for ProtectedRoute
    - Test redirect when unauthenticated
    - Test rendering when authenticated
    - Test loading state handling
    - Test redirect URL preservation
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 10. Implement role-based access control
  - [x] 10.1 Create RoleGuard component
    - Create `components/auth/role-guard.tsx` with client directive
    - Accept `allowedRoles` and `requireAll` props
    - Check user roles from useAuth hook
    - Render children if user has required roles
    - Render fallback or access denied message otherwise
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 10.2 Add role-based UI elements
    - Add RoleGuard to sensitive actions (delete, edit) in orders and products lists
    - Show/hide admin-only features based on roles
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ]* 10.3 Write unit tests for RoleGuard
    - Test rendering with allowed roles
    - Test access denied with disallowed roles
    - Test requireAll vs any role logic
    - _Requirements: 5.2, 5.3, 5.4, 5.6_

- [x] 11. Add logout functionality to UI
  - Add logout button to sidebar navigation in `components/layout/app-sidebar.tsx`
  - Call `logout()` from useAuth on button click
  - Show user email/username in sidebar when authenticated
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 12. Implement session refresh on 401 responses
  - Update `authenticatedFetch()` to catch 401 responses
  - Attempt session refresh once before logging out
  - Retry original request if refresh succeeds
  - Log out user if refresh fails
  - _Requirements: 7.3, 9.2, 9.3, 9.5_

- [x] 13. Add loading states and error boundaries
  - [x] 13.1 Create loading component for auth checks
    - Create reusable loading spinner component
    - Use in ProtectedRoute while checking authentication
    - Use in login page during submission
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 13.2 Implement error handling for edge cases
    - Handle network errors during login
    - Handle token expiration gracefully
    - Handle malformed responses from Strapi
    - Log errors to console for debugging (without sensitive data)
    - _Requirements: 10.2, 10.3, 10.4, 12.2_

- [x] 14. Security hardening
  - Add input sanitization to login form
  - Validate JWT token format before storage
  - Ensure no sensitive data logged to console
  - Add password visibility toggle to login form
  - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_

- [x] 15. Final integration and testing
  - [x] 15.1 Test complete authentication flow
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test session persistence across page refresh
    - Test logout clears session
    - Test protected routes redirect when unauthenticated
    - Test role-based access control
    - _Requirements: All_
  
  - [x] 15.2 Verify API integration
    - Ensure all API calls include Authorization header
    - Test 401 handling triggers logout
    - Verify existing functionality (orders, products, users) works with auth
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [ ]* 15.3 Write integration tests
    - Test full login-to-dashboard flow
    - Test session restoration on app reload
    - Test logout and re-login flow
    - Test protected route access patterns
    - _Requirements: All_

- [x] 16. Final checkpoint - Complete feature verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Implementation follows existing codebase patterns (TypeScript, React Hook Form, Zod, TanStack Query)
- Authentication uses Strapi's built-in `/api/auth/local` endpoint
- JWT tokens stored in localStorage for simplicity
- All API requests automatically include Authorization header after login
- 401 responses trigger automatic logout and redirect to login page
- Role-based access control allows fine-grained feature restrictions
