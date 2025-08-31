# Implementation Plan

- [x] 1. Update Home.jsx to use authenticated library service

  - Replace direct localStorage manipulation with useLibrary hook for authenticated users
  - Import and use the useLibrary hook in Home.jsx component
  - Update handleAddToLibrary function to use addManhwa for authenticated users
  - Maintain localStorage fallback for non-authenticated users
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 2. Implement proper error handling and user feedback

  - Add try-catch blocks around addManhwa calls in handleAddToLibrary
  - Handle duplicate error responses (409 Conflict) specifically
  - Display appropriate notification messages for different error scenarios
  - Ensure notification styling matches existing success/error patterns
  - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [x] 3. Add comprehensive duplicate checking for localStorage fallback

  - Enhance localStorage duplicate checking to match backend logic
  - Check for duplicates by both ID and title in localStorage
  - Show consistent error messages for localStorage duplicate scenarios
  - Ensure notification behavior matches authenticated user experience
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 4. Create unit tests for duplicate prevention logic

  - Write tests for Home.jsx handleAddToLibrary function with authenticated users
  - Test duplicate scenario handling and error message display
  - Test localStorage fallback duplicate checking for non-authenticated users
  - Verify notification system integration works correctly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Create integration tests for cross-page consistency

  - Test adding manhwa from Search page then attempting to add same from Home page
  - Verify duplicate prevention works across different components
  - Test authentication state changes and library migration scenarios
  - Ensure consistent behavior between authenticated and non-authenticated flows
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 4.1, 4.2_

- [ ] 6. Verify backend duplicate prevention robustness
  - Review and test existing libraryService.js duplicate checking logic
  - Ensure proper error responses for different duplicate scenarios
  - Test database constraint handling and error message formatting
  - Verify transaction integrity during duplicate prevention checks
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

