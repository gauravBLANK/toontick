# Design Document

## Overview

The library duplicate prevention feature ensures that users cannot add the same manhwa multiple times to their library when adding from the Featured Manhwa section. The current implementation has partial duplicate prevention in the backend service, but the frontend Featured Manhwa section bypasses this by using localStorage directly instead of the proper authenticated library service.

This design addresses the inconsistency by ensuring all library operations go through the centralized library service, which already contains robust duplicate prevention logic.

## Architecture

### Current State Analysis

**Backend (libraryService.js):**
- ✅ Already has duplicate prevention in `addToLibrary` function
- ✅ Checks by both manhwa ID and title for comprehensive duplicate detection
- ✅ Returns appropriate error messages for duplicates
- ✅ Handles database constraint violations gracefully

**Frontend Issues:**
- ❌ Home.jsx bypasses the library service for Featured Manhwa
- ❌ Uses localStorage directly instead of authenticated library operations
- ❌ No proper error handling for duplicate scenarios
- ❌ Inconsistent behavior between Search page and Home page

### Target Architecture

```mermaid
graph TD
    A[Featured Manhwa Card] --> B[Add to Library Button Click]
    B --> C{User Authenticated?}
    C -->|Yes| D[useLibrary.addManhwa]
    C -->|No| E[localStorage fallback]
    D --> F[libraryService.addToLibrary]
    F --> G[Duplicate Check Query]
    G --> H{Duplicate Found?}
    H -->|Yes| I[Return 409 Conflict]
    H -->|No| J[Insert to Database]
    I --> K[Show "Already in Library" Message]
    J --> L[Show Success Message]
    E --> M[Local Duplicate Check]
    M --> N{Already in Local Storage?}
    N -->|Yes| K
    N -->|No| O[Add to localStorage]
```

## Components and Interfaces

### 1. Frontend Components

**Home.jsx Updates:**
- Replace direct localStorage manipulation with `useLibrary` hook
- Use `addManhwa` function for authenticated users
- Implement proper error handling for duplicate scenarios
- Show appropriate user feedback messages

**Card.jsx (Featured Card Type):**
- No changes needed - already calls `onRead` callback properly
- Button behavior remains the same

**Notification System:**
- Already exists and functional
- Will be used to show duplicate prevention messages

### 2. Backend Service (No Changes Needed)

**libraryService.js:**
- Current duplicate prevention logic is comprehensive
- Handles both ID-based and title-based duplicate detection
- Returns appropriate error messages
- Database constraint handling is already implemented

### 3. Hook Integration

**useLibrary.js:**
- Already implements proper error handling
- `addManhwa` function already calls the service correctly
- Error messages are properly propagated to UI

## Data Models

### Duplicate Detection Logic

**Primary Check (ID-based):**
```sql
SELECT id, title, manhwa_id 
FROM user_library 
WHERE user_id = ? AND manhwa_id = ?
```

**Secondary Check (Title-based):**
```sql
SELECT id, title, manhwa_id 
FROM user_library 
WHERE user_id = ? AND title ILIKE ?
```

**Database Constraint:**
- Unique constraint on `(user_id, manhwa_id)` already exists
- Provides final safety net against duplicates

### Error Response Format

**409 Conflict Response:**
```javascript
{
  error: "Manhwa Title is already in your library",
  code: "DUPLICATE_ENTRY",
  manhwa_id: "12345"
}
```

## Error Handling

### Backend Error Scenarios

1. **Duplicate by ID:** Returns specific error message with manhwa title
2. **Duplicate by Title:** Returns error indicating possible different ID
3. **Database Constraint Violation:** Catches 23505 error code and returns user-friendly message
4. **Database Connection Issues:** Returns generic "Failed to check" message

### Frontend Error Handling

1. **Authenticated Users:**
   - Use `useLibrary.addManhwa` which handles all error scenarios
   - Display error messages via notification system
   - Maintain consistent behavior with Search page

2. **Non-Authenticated Users:**
   - Continue using localStorage with duplicate checking
   - Show same notification format for consistency

### User Feedback Messages

- **Success:** "Manhwa Title added to your library!"
- **Duplicate:** "Manhwa Title is already in your library"
- **Error:** "Failed to add to library. Please try again."

## Testing Strategy

### Unit Tests

**Frontend Tests:**
1. Test Home.jsx `handleAddToLibrary` with authenticated user
2. Test duplicate scenario handling
3. Test error message display
4. Test notification system integration

**Backend Tests (Already Exist):**
1. Duplicate detection by ID
2. Duplicate detection by title
3. Database constraint handling
4. Error message formatting

### Integration Tests

1. **End-to-End Duplicate Prevention:**
   - Add manhwa from Featured section
   - Attempt to add same manhwa again
   - Verify duplicate prevention message

2. **Cross-Page Consistency:**
   - Add manhwa from Search page
   - Attempt to add same manhwa from Home page
   - Verify consistent behavior

3. **Authentication State Changes:**
   - Add manhwa while unauthenticated (localStorage)
   - Sign in and verify library migration
   - Attempt to add same manhwa after authentication

### Manual Testing Scenarios

1. **Happy Path:** Add new manhwa successfully
2. **Duplicate Prevention:** Try adding existing manhwa
3. **Network Errors:** Test with poor connectivity
4. **Database Errors:** Test with invalid data
5. **Authentication Edge Cases:** Test sign-in/sign-out scenarios

## Implementation Notes

### Key Changes Required

1. **Home.jsx:** Replace localStorage logic with `useLibrary` hook
2. **Error Handling:** Ensure proper try-catch and user feedback
3. **Consistency:** Match Search page behavior exactly

### Backward Compatibility

- Non-authenticated users continue using localStorage
- Existing library data remains unchanged
- Migration logic already handles localStorage to Supabase transition

### Performance Considerations

- Duplicate checks are already optimized with database indexes
- Frontend state updates are minimal and efficient
- No additional API calls required beyond existing flow