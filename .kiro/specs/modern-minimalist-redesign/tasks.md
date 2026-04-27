# Implementation Plan: Modern Minimalist Dashboard Redesign

## Overview

This implementation plan transforms the business management dashboard into a modern minimalist interface using only existing dependencies (Tailwind CSS 4.1, shadcn/ui, Radix UI, Lucide React). The redesign maintains all functionality while improving visual clarity, consistency, and user experience through refined aesthetics, intentional whitespace, and smooth animations.

The implementation follows a phased approach: design system foundation, core components, layout redesign, feature pages, and polish. Each task builds incrementally, ensuring testable progress at every stage.

## Tasks

- [x] 1. Design System Foundation - Update globals.css and establish design tokens
  - [x] 1.1 Update globals.css with minimalist color palette and design tokens
    - Replace existing color variables with minimalist neutral palette (oklch format)
    - Define light mode colors: neutral 50-900, primary (black), semantic colors (success, warning, error)
    - Define dark mode colors: inverted neutral palette, adjusted semantic colors
    - Add chart colors (monochromatic with subtle variations)
    - Define spacing, radius, and sidebar variables
    - Add @theme inline block for Tailwind CSS 4.1 compatibility
    - Remove background gradients for pure minimalism
    - Add minimalist animation utilities (fade-in, slide-up)
    - _Requirements: 1.1, 1.2, 8.3, 8.7, 12.1, 12.2, 12.3, 20.1, 22.6, 22.7, 22.8, 22.9, 22.10, 23.1, 23.2, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.9, 24.10_
  
  - [ ]* 1.2 Write property test for color contrast compliance
    - **Property 2: Accessibility Compliance - Color Contrast**
    - **Property 11: Theme Color Consistency**
    - **Validates: Requirements 11.1, 11.2, 22.6, 22.7, 22.8, 22.9, 22.10**
    - Test all foreground/background color combinations meet WCAG AA (4.5:1 contrast ratio)
    - Test both light and dark themes
    - Use fast-check to generate color pair combinations
  
  - [ ]* 1.3 Write property test for spacing scale consistency
    - **Property 7: Whitespace Consistency**
    - **Validates: Requirements 1.2, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.9, 24.10**
    - Test all spacing values are multiples of 4px base unit
    - Verify spacing scale maintains consistent ratios

- [x] 2. Core UI Components - Create minimalist component variants
  - [x] 2.1 Create MinimalistCard component with variants
    - Create components/ui/minimalist-card.tsx
    - Implement variants: default, elevated, flat, bordered
    - Implement padding options: none, sm, md, lg
    - Add hover prop for interactive cards with scale effect
    - Use class-variance-authority for variant management
    - Apply design tokens for colors, shadows, borders, transitions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 23.3, 23.4, 23.5, 23.9, 23.10_
  
  - [ ]* 2.2 Write property test for card component styling
    - **Property 1: Visual Consistency**
    - **Property 9: Component Hover Effects**
    - **Validates: Requirements 2.7, 12.1, 12.2, 12.3, 23.9**
    - Test all variants use only design token colors
    - Test hover transitions complete within 300ms
    - Verify shadow elevation system consistency
  
  - [x] 2.3 Update existing Button component with minimalist styling
    - Update components/ui/button.tsx
    - Refine variants to use minimalist color palette
    - Ensure primary variant uses black/white contrast
    - Add smooth transitions (250ms ease-in-out)
    - Maintain existing variant structure (default, destructive, outline, secondary, ghost, link)
    - Apply design tokens for consistency
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_
  
  - [x] 2.4 Update existing Input component with minimalist styling
    - Update components/ui/input.tsx
    - Apply subtle borders (neutral-200/neutral-800)
    - Add focus ring with smooth transition
    - Ensure proper contrast in both themes
    - Maintain accessibility attributes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10_
  
  - [x] 2.5 Update existing Table component with minimalist styling
    - Update components/ui/table.tsx
    - Apply subtle row borders (neutral-200/neutral-800)
    - Add smooth hover effect on rows (background color transition)
    - Refine header styling with medium font weight
    - Ensure proper spacing and alignment
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_
  
  - [ ]* 2.6 Write property test for interactive component accessibility
    - **Property 2: Accessibility Compliance**
    - **Property 12: Touch Target Accessibility**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.11, 18.1, 18.2**
    - Test all interactive elements have accessible names
    - Test focus indicators are visible
    - Test touch targets are minimum 44x44px on mobile
    - Verify keyboard navigation works

- [x] 3. Skeleton Loading Components - Create minimalist loading states
  - [x] 3.1 Create Skeleton component for loading states
    - Create components/ui/skeleton.tsx (if not exists) or update existing
    - Implement pulse animation with subtle opacity changes
    - Use neutral-200/neutral-800 background colors
    - Support variant shapes: text, circular, rectangular
    - Apply design tokens for consistency
    - _Requirements: 7.1, 7.4, 7.5, 7.7, 13.5_
  
  - [x] 3.2 Create skeleton variants for common components
    - Create components/ui/skeleton-card.tsx for card loading states
    - Create components/ui/skeleton-table.tsx for table loading states
    - Create components/ui/skeleton-chart.tsx for chart loading states
    - Ensure skeletons match final layout structure
    - _Requirements: 7.1, 7.4, 7.5, 7.7_
  
  - [ ]* 3.3 Write property test for loading state clarity
    - **Property 6: Loading State Clarity**
    - **Validates: Requirements 7.1, 7.4, 7.5, 7.7, 13.5**
    - Test all data-driven components have skeleton states
    - Verify skeletons match final layout structure
    - Test skeleton animations are smooth

- [x] 4. Checkpoint - Verify design system foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Layout Components - Redesign sidebar and main layout
  - [x] 5.1 Create MinimalistSidebar component
    - Create components/layout/minimalist-sidebar.tsx
    - Implement clean navigation with active state indicators
    - Use Lucide React icons (LayoutDashboard, ShoppingCart, Package, Users)
    - Add smooth transitions for active state (background, text color)
    - Implement mobile responsive behavior with slide-in drawer
    - Add mobile menu button with Menu/X icons
    - Include logo/title section at top
    - Add version footer at bottom
    - Apply design tokens for colors, spacing, borders
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 21.1, 21.5, 21.6_
  
  - [ ]* 5.2 Write property test for responsive sidebar behavior
    - **Property 4: Responsive Behavior**
    - **Validates: Requirements 9.4, 9.5, 9.10**
    - Test sidebar is usable at all viewport sizes
    - Verify no horizontal scrolling occurs
    - Test mobile drawer opens/closes smoothly
  
  - [x] 5.3 Update root layout to use MinimalistSidebar
    - Update app/layout.tsx
    - Replace existing sidebar with MinimalistSidebar component
    - Ensure proper spacing for main content area
    - Maintain existing providers (React Query, theme)
    - Test navigation works correctly
    - _Requirements: 8.1, 8.2, 9.1, 9.2_

- [x] 6. Dashboard Page Redesign - Implement minimalist dashboard
  - [x] 6.1 Create MinimalistKPICards component
    - Create components/dashboard/minimalist-kpi-cards.tsx
    - Use MinimalistCard with elevated variant and hover effect
    - Display title, value, and trend indicator
    - Use TrendingUp/TrendingDown icons from Lucide React
    - Apply color coding for trends (emerald for up, rose for down)
    - Format currency values with French locale
    - Implement responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 21.1_
  
  - [ ]* 6.2 Write unit tests for KPI card data formatting
    - Test currency formatting with French locale
    - Test trend direction logic
    - Test responsive grid layout
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [x] 6.3 Create MinimalistRevenueChart component
    - Create components/dashboard/minimalist-revenue-chart.tsx
    - Use MinimalistCard as container
    - Implement bar chart with clean vertical bars
    - Calculate bar heights as percentage of max value (min 8px height)
    - Add hover effects on bars (opacity transition)
    - Display date labels below bars (French format)
    - Show total and average revenue in footer
    - Use neutral-900/neutral-50 for bar colors
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_
  
  - [ ]* 6.4 Write property test for chart data visualization
    - **Property 16: Chart Data Visualization**
    - **Validates: Requirements 5.8, 5.11**
    - Test bar heights are calculated correctly as percentages
    - Verify minimum bar height of 8px
    - Test chart handles empty data gracefully
  
  - [x] 6.5 Create MinimalistOrderStatusChart component
    - Create components/dashboard/minimalist-order-status-chart.tsx
    - Implement donut chart or simple bar chart for order status distribution
    - Use monochromatic color scheme (chart-1 through chart-5)
    - Display status labels and counts
    - Add legend with status names
    - Apply smooth transitions on data updates
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_
  
  - [x] 6.6 Create MinimalistRecentOrdersTable component
    - Create components/dashboard/minimalist-recent-orders-table.tsx
    - Use updated Table component with minimalist styling
    - Display order number, customer, date, status, total
    - Add hover effect on rows
    - Make rows clickable to navigate to order detail
    - Format dates and currency with French locale
    - Show loading skeleton while data fetches
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 7.1, 7.4, 7.5, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_
  
  - [x] 6.7 Update dashboard page to use new minimalist components
    - Update app/page.tsx
    - Replace existing dashboard components with minimalist versions
    - Implement skeleton loading states for all data sections
    - Use TanStack Query for data fetching (maintain existing patterns)
    - Apply fade-in animations on content load
    - Ensure proper spacing between sections
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 7.4, 7.5, 7.7_
  
  - [ ]* 6.8 Write integration test for dashboard loading flow
    - Test skeleton states appear immediately
    - Verify smooth transition from skeleton to content
    - Test all components render with minimalist styling
    - Verify animations are smooth
    - _Requirements: 7.1, 7.4, 7.5, 7.7_

- [x] 7. Checkpoint - Verify dashboard redesign
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Orders Pages Redesign - Apply minimalist design to orders section
  - [ ] 8.1 Update orders list page with minimalist styling
    - Update app/orders/page.tsx
    - Use MinimalistCard for page container
    - Apply minimalist styling to orders table
    - Add skeleton loading state
    - Implement smooth hover effects on table rows
    - Ensure proper spacing and typography
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10, 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ] 8.2 Update order detail page with minimalist styling
    - Update app/orders/[id]/page.tsx
    - Use MinimalistCard for order information sections
    - Apply minimalist styling to order line items table
    - Add skeleton loading state
    - Ensure proper visual hierarchy (headings, sections)
    - Apply smooth transitions on status updates
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10, 2.1, 2.2, 15.1, 15.2_
  
  - [ ] 8.3 Update order create/edit form with minimalist styling
    - Update app/orders/new/page.tsx and components/orders/order-create-form.tsx
    - Use MinimalistCard for form container
    - Apply minimalist styling to form inputs (use updated Input component)
    - Style form buttons with updated Button component
    - Add smooth transitions on form validation errors
    - Ensure proper spacing between form fields
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.10, 13.1, 14.1, 14.2_
  
  - [ ]* 8.4 Write property test for form accessibility
    - **Property 2: Accessibility Compliance**
    - **Validates: Requirements 11.1, 11.2, 11.3, 14.6, 14.7, 19.6, 19.7**
    - Test all form inputs have labels
    - Verify error messages are announced to screen readers
    - Test keyboard navigation through form fields
    - Verify focus indicators are visible

- [x] 9. Products Pages Redesign - Apply minimalist design to products section
  - [x] 9.1 Update products list page with minimalist styling
    - Update app/products/page.tsx
    - Use MinimalistCard for page container
    - Apply minimalist styling to products table/grid
    - Add skeleton loading state
    - Implement smooth hover effects
    - Ensure proper spacing and typography
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10, 15.1, 15.2, 15.3_
  
  - [x] 9.2 Update product forms with minimalist styling
    - Update product create/edit forms in components/products/
    - Use MinimalistCard for form container
    - Apply minimalist styling to all form inputs
    - Style buttons with updated Button component
    - Add smooth transitions on interactions
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.10, 13.1, 14.1_

- [x] 10. Users Pages Redesign - Apply minimalist design to users section
  - [x] 10.1 Update users list page with minimalist styling
    - Update app/users/page.tsx
    - Use MinimalistCard for page container
    - Apply minimalist styling to users table
    - Add skeleton loading state
    - Implement smooth hover effects
    - Ensure proper spacing and typography
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10, 15.1, 15.2, 15.3_
  
  - [x] 10.2 Update user forms with minimalist styling
    - Update user create/edit forms in components/users/
    - Use MinimalistCard for form container
    - Apply minimalist styling to all form inputs
    - Style buttons with updated Button component
    - Add smooth transitions on interactions
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.10, 13.1, 14.1_

- [x] 11. Checkpoint - Verify feature pages redesign
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Shared Components - Update remaining shared components
  - [x] 12.1 Update Badge component with minimalist styling
    - Update components/ui/badge.tsx
    - Apply subtle background colors
    - Use medium font weight
    - Ensure proper contrast in both themes
    - Add smooth transitions
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 25.10_
  
  - [x] 12.2 Update Dialog/Modal components with minimalist styling
    - Update components/ui/dialog.tsx
    - Apply subtle backdrop (neutral-900/20 with backdrop-blur)
    - Use MinimalistCard styling for dialog content
    - Ensure smooth fade-in animation
    - Implement focus trap and Escape key handling
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 26.10_
  
  - [ ]* 12.3 Write property test for modal focus management
    - **Property 15: Modal Focus Management**
    - **Validates: Requirements 26.6, 26.7, 26.8**
    - Test modals trap focus when open
    - Verify focus is restored on close
    - Test Escape key closes modal
  
  - [x] 12.4 Update Toast component with minimalist styling
    - Update components/ui/toast.tsx or sonner configuration
    - Apply minimalist card styling
    - Use subtle shadows and borders
    - Implement smooth slide-in animation
    - Ensure 5-second auto-dismiss with pause on hover
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 27.10_
  
  - [ ]* 12.5 Write property test for toast auto-dismiss
    - **Property 19: Toast Auto-Dismiss**
    - **Validates: Requirements 27.6, 27.7**
    - Test toasts auto-dismiss after 5 seconds
    - Verify auto-dismiss pauses on hover
  
  - [x] 12.6 Update Select/Dropdown components with minimalist styling
    - Update components/ui/select.tsx
    - Apply minimalist styling to trigger and content
    - Use subtle borders and shadows
    - Add smooth transitions on open/close
    - Ensure proper keyboard navigation
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 28.10_
  
  - [x] 12.7 Update Search/Filter components with minimalist styling
    - Update search input components
    - Apply minimalist Input styling
    - Implement 300ms debounce for search
    - Add subtle loading indicator
    - Ensure smooth transitions
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 29.10_
  
  - [ ]* 12.8 Write property test for input debouncing
    - **Property 18: Input Debouncing**
    - **Validates: Requirements 29.3**
    - Test search inputs debounce by 300ms
    - Verify search triggers after delay
  
  - [x] 12.9 Update Pagination component with minimalist styling
    - Update components/ui/pagination.tsx or create if needed
    - Apply minimalist button styling
    - Disable previous button on first page
    - Disable next button on last page
    - Add smooth transitions on page changes
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 30.10_
  
  - [ ]* 12.10 Write property test for pagination state management
    - **Property 17: Pagination State Management**
    - **Validates: Requirements 30.3, 30.4**
    - Test previous button disabled on first page
    - Test next button disabled on last page

- [x] 13. Error Handling Implementation - Implement comprehensive error handling with toast notifications
  - [x] 13.1 Create error boundary component for React errors
    - Create components/ui/error-boundary.tsx
    - Implement React ErrorBoundary with fallback UI
    - Display minimalist error message with retry button
    - Log errors to console for debugging
    - Use MinimalistCard for error display container
    - Include error icon (AlertCircle from Lucide React)
    - Apply rose red color for error messaging
    - _Requirements: 15.1, 15.2, 15.4, 15.7, 15.9, 15.10_
  
  - [x] 13.2 Wrap main application with error boundary
    - Update app/layout.tsx to wrap children with ErrorBoundary
    - Ensure error boundary catches component errors gracefully
    - Test error boundary with intentional error
    - _Requirements: 15.8, 15.9_
  
  - [x] 13.3 Implement API error handling with toast notifications
    - Update lib/api.ts to handle API errors consistently
    - Add error toast notifications for failed API requests
    - Use sonner toast with error variant (red accent)
    - Display actionable error messages
    - Include retry functionality for recoverable errors
    - Log errors to console for debugging
    - _Requirements: 15.1, 15.2, 15.4, 15.7, 15.8, 15.9, 15.10, 27.1, 27.2, 27.4, 27.5, 27.8, 27.9_
  
  - [x] 13.4 Add error states to TanStack Query hooks
    - Update data fetching hooks to handle error states
    - Display error messages in components when queries fail
    - Show retry button for failed queries
    - Use minimalist error styling (rose red, small font, medium weight)
    - Ensure layout stability when errors appear/disappear
    - _Requirements: 15.1, 15.2, 15.3, 15.5, 15.6, 15.7, 15.10, 17.5_
  
  - [x] 13.5 Implement form validation error display
    - Update form components to display validation errors
    - Show error messages below form fields with fade-in animation
    - Include error icon (AlertCircle) next to error messages
    - Apply rose red color for error text
    - Ensure errors clear when field is corrected (fade-out within 300ms)
    - Maintain layout stability when errors appear/disappear
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [x] 13.6 Add network error handling
    - Detect network connectivity issues
    - Display toast notification for offline state
    - Show retry button when network is restored
    - Cache failed requests for retry when online
    - Use warning variant toast for network issues
    - _Requirements: 15.7, 15.8, 15.10, 27.1, 27.2, 27.5, 27.6, 27.7_
  
  - [x] 13.7 Implement loading and error states for all data-driven components
    - Audit all components that fetch data (dashboard, orders, products, users)
    - Ensure each has skeleton loading state
    - Ensure each has error state with retry functionality
    - Apply consistent error messaging patterns
    - Test error recovery flows
    - _Requirements: 7.1, 7.4, 7.5, 15.1, 15.2, 15.7, 15.10, 17.8_
  
  - [ ]* 13.8 Write property test for error message clarity
    - **Property 21: Error Message Clarity**
    - **Validates: Requirements 15.7**
    - Test all error messages are actionable and descriptive
    - Verify error messages don't expose sensitive information
    - Test error messages provide guidance on resolution
  
  - [ ]* 13.9 Write integration test for error handling flows
    - Test API error triggers toast notification
    - Test form validation errors display correctly
    - Test error boundary catches component errors
    - Test network error handling and retry
    - Verify error recovery flows work end-to-end
    - _Requirements: 15.1, 15.3, 15.8, 15.10_

- [ ] 14. Polish & Refinement - Final touches and consistency checks
  - [x] 14.1 Audit all pages for typography consistency
    - Verify all headings use correct font sizes and weights
    - Ensure body text uses base size (16px)
    - Check line heights are appropriate (1.5 for body, 1.25 for headings)
    - Verify letter spacing is consistent
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.10_
  
  - [ ]* 14.2 Write property test for typography hierarchy
    - **Property 8: Typography Hierarchy**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.10**
    - Test each page has exactly one h1
    - Verify heading font sizes are larger than body text
    - Test heading font weights are semibold or bolder
  
  - [x] 14.3 Audit all components for animation consistency
    - Verify all transitions use 150-350ms duration
    - Ensure all animations use ease-in-out easing
    - Check hover effects are smooth and consistent
    - Test animations run at 60fps
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_
  
  - [ ]* 14.4 Write property test for animation performance
    - **Property 3: Animation Performance**
    - **Property 5: State Transition Smoothness**
    - **Validates: Requirements 10.1, 10.2, 10.3, 2.8, 5.6, 8.2, 9.5**
    - Test animations run at 60fps
    - Verify animations use GPU-accelerated properties
    - Test animation durations are within 150-400ms range
  
  - [x] 14.5 Audit all components for spacing consistency
    - Verify all spacing uses design token values
    - Check padding and margins are consistent across similar components
    - Ensure proper spacing between sections
    - Test responsive spacing adjustments
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.9, 24.10_
  
  - [x] 14.6 Audit all components for color consistency
    - Verify all colors use design tokens
    - Check dark mode colors are properly applied
    - Ensure semantic colors (success, warning, error) are used consistently
    - Test theme switching works smoothly
    - _Requirements: 1.1, 8.3, 8.7, 12.1, 12.2, 12.3, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 22.10_
  
  - [x] 14.7 Audit all icons for consistency
    - Verify all icons are from Lucide React
    - Check icon sizes are consistent (typically 16px or 20px)
    - Ensure icon colors inherit from parent text
    - Test icon stroke width is 2px
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 21.10_

- [ ] 15. Accessibility Audit - Comprehensive accessibility testing
  - [ ] 15.1 Run automated accessibility tests with jest-axe
    - Install and configure jest-axe
    - Write tests for all major pages (dashboard, orders, products, users)
    - Fix any violations found
    - Ensure zero accessibility violations
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11_
  
  - [ ] 15.2 Test keyboard navigation across all pages
    - Verify Tab key navigates through interactive elements in logical order
    - Test Enter/Space activate buttons and links
    - Ensure Escape closes modals and dropdowns
    - Test arrow keys work in dropdowns and menus
    - Verify focus indicators are visible on all interactive elements
    - _Requirements: 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 26.8, 28.7_
  
  - [ ] 15.3 Test screen reader compatibility
    - Verify all images have alt text
    - Check all form inputs have labels
    - Ensure ARIA labels are present where needed
    - Test landmark regions are properly defined
    - Verify dynamic content updates are announced
    - _Requirements: 11.2, 11.9, 11.10, 11.11, 14.6, 14.7, 19.6, 19.7_

- [x] 16. Performance Testing - Verify performance targets
  - [x] 16.1 Run Lighthouse audits on all major pages
    - Test dashboard page
    - Test orders list page
    - Test products list page
    - Ensure Performance score > 90
    - Ensure Accessibility score = 100
    - Ensure Best Practices score > 90
    - _Requirements: 10.1, 10.2, 10.3, 11.1_
  
  - [x] 16.2 Measure and optimize bundle sizes
    - Check initial bundle size < 200KB gzipped
    - Verify total JavaScript < 500KB gzipped
    - Check CSS bundle < 50KB gzipped
    - Optimize if necessary (tree-shaking, code splitting)
    - _Requirements: 10.4, 10.5_
  
  - [x] 16.3 Test animation performance
    - Use Chrome DevTools Performance panel
    - Record interactions with animations
    - Verify 60fps frame rate
    - Check for animation jank
    - Optimize if necessary
    - _Requirements: 10.1, 10.2, 10.3, 10.6, 10.7_
  
  - [ ]* 16.4 Write property test for layout stability
    - **Property 20: Layout Stability**
    - **Validates: Requirements 7.7, 16.4**
    - Test Cumulative Layout Shift < 0.1
    - Verify loading-to-loaded transitions don't cause layout shift

- [x] 17. Final Checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are met
  - Test complete user flows (dashboard → orders → order detail → edit)
  - Verify theme switching works across all pages
  - Test responsive behavior on mobile, tablet, and desktop
  - Confirm all animations are smooth and purposeful
  - Validate accessibility compliance
  - Check performance metrics meet targets

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests verify complete user flows
- All implementation uses existing dependencies (no new libraries)
- Design tokens ensure visual consistency across all components
- Skeleton loading states provide better perceived performance than spinners
- Accessibility is built in from the start, not added later
- Performance is monitored throughout implementation
