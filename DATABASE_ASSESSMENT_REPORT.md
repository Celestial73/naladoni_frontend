# Database & Data Structure Assessment Report

## Executive Summary

This assessment identifies critical issues in data handling, API service consistency, and data structure management throughout the frontend codebase. The issues range from typographical errors to serious data consistency problems that could lead to runtime errors and data corruption.

**Update**: Based on API documentation provided, the participants structure is now understood:
- `participants`: Array of `{profile (required), user (optional)}`
- `profile`: Always present with full profile data
- `user`: Optional, only present when requester is event owner or using `/events/me` endpoint

This context explains the complex fallback logic, but the issues identified remain valid and have been addressed with utility functions and consistent transformations.

---

## Critical Issues

### 1. **Inconsistent ID Field Handling** ⚠️ CRITICAL

**Location**: Multiple files (`eventsService.js`, `feedService.js`, `useEventDetail.js`)

**Problem**: The code inconsistently handles `id` vs `_id` fields:
```javascript
id: apiEvent.id || apiEvent._id
```

**Issues**:
- If both `id` and `_id` exist with different values, the code will use `id` and ignore `_id`, potentially causing data mismatches
- No validation that the ID is actually present
- Mixed usage throughout codebase creates uncertainty about which field to use

**Impact**: 
- Data corruption if API returns both fields with different values
- Potential null/undefined IDs causing runtime errors
- Inconsistent behavior across different API responses

**Recommendation**:
- Standardize on a single ID field (`id` or `_id`)
- Add validation to ensure ID exists before use
- Create a utility function to extract IDs consistently

---

### 2. **Missing Data Transformation in `getEvent`** ⚠️ HIGH

**Location**: `src/api/services/eventsService.js:85-96`

**Problem**: The `getEvent` method does NOT transform the event data, while `getMyEvents` and `getAcceptedEvents` do:

```javascript
// getEvent - NO transformation
getEvent: async (eventId, signal) => {
  const response = await axiosPrivate.get(`/events/${eventId}`, config);
  return response.data; // Returns raw API data
}

// getMyEvents - HAS transformation
getMyEvents: async (signal) => {
  const events = response.data.results || response.data || [];
  return events.map(transformEvent); // Transforms data
}
```

**Impact**:
- `useEventDetail` hook manually transforms data, but this is inconsistent
- Different data structures returned for the same entity
- Components must handle both transformed and untransformed formats
- Code duplication in transformation logic

**Recommendation**:
- Apply `transformEvent` in `getEvent` method
- Ensure all event-fetching methods return consistent data structures

---

### 3. **Overly Complex Participant ID Extraction** ⚠️ HIGH

**Location**: `EventInformation.jsx:111-117`, `EventCard.jsx:234-240`

**Problem**: Extremely complex fallback chain suggests uncertainty about data structure:

```javascript
const participantId = attendee.profile_id ||
                     attendee.user_id || 
                     attendee.participant_id ||
                     (typeof attendee.user === 'object' ? attendee.user?.id || attendee.user?.user_id : null) ||
                     (typeof attendee.user === 'string' || typeof attendee.user === 'number' ? attendee.user : null) ||
                     attendee.telegram_id ||
                     null;
```

**Issues**:
- 7 different fallback options indicate unclear data contract
- Could silently use wrong ID if multiple fields exist
- Makes debugging extremely difficult
- Duplicated in multiple files

**Impact**:
- Wrong participant could be deleted if wrong ID is used
- Silent failures if all fallbacks fail
- Maintenance nightmare

**Recommendation**:
- Standardize participant ID field in API response
- Create a single utility function for ID extraction
- Add validation and error logging when ID cannot be found

---

### 4. **Inconsistent Participant Data Structure** ⚠️ MEDIUM

**Location**: `eventsService.js:17-43`, `useEventDetail.js:10-50`

**Problem**: Data is transformed from nested `{profile, user}` to flat structure, but components access both:

```javascript
// Transformation creates flat structure
return {
  profile_name: profile.profile_name || user.telegram_name || '',
  user_id: user._id || user.id,
  // ... but also includes nested objects
  user: user,
  profile: profile,
};

// Components then access both formats
attendee.profile_name  // flat
attendee.user.telegram_username  // nested
```

**Impact**:
- Confusion about which structure to use
- Potential null reference errors if nested structure is missing
- Inconsistent data access patterns

**Recommendation**:
- Choose one structure (preferably flat) and stick to it
- Remove nested objects if not needed, or document when to use each

---

### 5. **Typo in Documentation** ⚠️ LOW

**Location**: `src/api/services/baseService.js:59`

**Problem**: Typo in JSDoc comment:
```javascript
* @returns {Object} Axios reqwuest config  // Should be "request"
```

**Impact**: Minor - documentation only, but unprofessional

**Recommendation**: Fix typo

---

### 6. **Missing Validation for Required Fields** ⚠️ MEDIUM

**Location**: Throughout codebase

**Problem**: No validation that required fields exist before use:

```javascript
// No check if event.id exists
await eventsService.deleteEvent(event.id);

// No check if participantId is valid
await eventsService.deleteParticipant(event.id, participantId);
```

**Impact**:
- Runtime errors if fields are missing
- Poor error messages for users
- Potential API calls with invalid data

**Recommendation**:
- Add validation before API calls
- Provide clear error messages
- Consider using TypeScript or PropTypes for type checking

---

### 7. **Inconsistent Date Handling** ⚠️ MEDIUM

**Location**: Multiple files

**Problem**: Some places format dates, others don't:

```javascript
// eventsService.js - formats date
date: formatDateToDDMMYYYY(apiEvent.date) || '',

// useCreateEvent.js - expects ISO format for form
const dateStr = parseISODateToFormInput(event.date || '');
```

**Impact**:
- Date format mismatches
- Potential timezone issues
- Form inputs may not work correctly

**Recommendation**:
- Standardize date format throughout
- Use a date utility library (e.g., date-fns)
- Document expected date formats

---

### 8. **Profile ID vs User ID Confusion** ⚠️ MEDIUM

**Location**: Throughout codebase

**Problem**: Unclear distinction between `profile_id`, `user_id`, and `id`:

```javascript
// Multiple ID fields used interchangeably
profile_id: profile._id || profile.id,
user_id: user._id || user.id,
```

**Impact**:
- Wrong ID used for navigation or API calls
- User profile pages may show wrong data
- Deletion operations may target wrong entity

**Recommendation**:
- Document the difference between profile_id and user_id
- Use consistent naming
- Add validation to ensure correct ID is used for each operation

---

### 9. **Missing Error Handling for Data Transformations** ⚠️ MEDIUM

**Location**: `eventsService.js:17-57`, `feedService.js:17-58`

**Problem**: Transformation functions don't handle edge cases:

```javascript
const transformEvent = (apiEvent) => {
  // No validation that apiEvent exists
  // No validation that required fields exist
  // Silent failures if data is malformed
  let attendees = [];
  if (apiEvent.participants && Array.isArray(apiEvent.participants)) {
    // ...
  }
  // What if apiEvent is null/undefined?
  // What if apiEvent.participants is not an array?
};
```

**Impact**:
- Runtime errors with malformed API responses
- Silent data loss
- Difficult to debug issues

**Recommendation**:
- Add input validation
- Add error logging for malformed data
- Return default/empty structures for invalid data

---

### 10. **Inconsistent Response Data Access** ⚠️ LOW

**Location**: Multiple service files

**Problem**: Different ways to access response data:

```javascript
// eventsService.js
const events = response.data.results || response.data || [];

// feedService.js
return transformEvent(response.data);  // Assumes response.data exists

// profileService.js
return response.data;  // No fallback
```

**Impact**:
- Inconsistent error handling
- Some methods may fail if API response structure changes
- Hard to maintain

**Recommendation**:
- Standardize response data extraction
- Add consistent fallbacks
- Create a response parser utility

---

## Data Structure Issues

### Event Object Structure

**Current Issues**:
1. Mixed `id`/`_id` usage
2. Inconsistent `image` vs `picture` field names
3. Both `attendees` and `participants` fields (legacy support)
4. Nested and flat participant structures coexisting

**Recommended Structure**:
```javascript
{
  id: string,  // Standardized to 'id'
  title: string,
  date: string,  // ISO format internally, formatted for display
  location: string,
  description: string,
  capacity: number,
  image: string | null,  // Standardized to 'image'
  creator_profile: object,
  attendees: Array<{
    profile_id: string,  // Primary identifier
    user_id: string,
    profile_name: string,
    // ... other flat fields
  }>
}
```

### Participant Object Structure

**Current Issues**:
1. 7+ different ways to extract participant ID
2. Both nested and flat structures
3. Unclear which ID to use for deletion

**Recommended Structure**:
```javascript
{
  profile_id: string,  // Primary identifier for participant operations
  user_id: string,     // User identifier
  profile_name: string,
  age: number,
  bio: string,
  images: string[],
  // ... other fields (flat structure only)
}
```

---

## API Endpoint Issues

### 1. **Inconsistent Endpoint Patterns**

**Issues**:
- `/events/me` for user's events
- `/events/me/${eventId}` for event operations
- `/events/${eventId}` for getting event (no `/me`)
- `/events/me/${eventId}/participants/${participantId}` for participant deletion

**Impact**: Confusing API structure, potential security issues if permissions aren't checked

### 2. **Missing Error Responses**

No clear documentation of what error responses look like, making error handling inconsistent.

---

## Recommendations Summary

### ✅ Completed Actions

1. **✅ Fixed ID field handling** - Standardized to use `id` with `_id` as fallback, documented in transformation
2. **✅ Added transformation to `getEvent`** - Now returns consistent data structure like other methods
3. **✅ Simplified participant ID extraction** - Created `participantUtils.js` with centralized utility functions
4. **✅ Improved data transformation** - Enhanced `transformEvent` with better null handling and documentation

### Remaining Actions (High Priority)

1. **Add input validation** - Validate required fields before API calls
2. **Add error handling** - Handle malformed API responses gracefully
3. **Document data structures** - Create comprehensive type definitions or documentation

### Short-term Actions (High Priority)

5. **Standardize participant structure** - Choose flat or nested, not both
6. **Add error handling** - Handle malformed API responses
7. **Document data structures** - Create type definitions or documentation
8. **Fix typo** - Correct "reqwuest" to "request"

### Long-term Actions (Medium Priority)

9. **Consider TypeScript** - Add type safety
10. **Create data utilities** - Centralize data transformation logic
11. **Add unit tests** - Test data transformations
12. **API response standardization** - Work with backend to standardize responses

---

## Code Quality Issues

### Duplication
- Participant ID extraction duplicated in 3+ files
- Event transformation logic duplicated
- Similar error handling patterns repeated

### Maintainability
- Complex fallback chains make code hard to understand
- Inconsistent patterns make onboarding difficult
- Missing documentation for data structures

### Testing
- No visible tests for data transformations
- No validation of edge cases
- Hard to test due to complex fallback logic

---

## Conclusion

The codebase has several critical data handling issues that could lead to runtime errors, data corruption, and maintenance difficulties. The most critical issues are:

1. Inconsistent ID field handling
2. Missing data transformation in `getEvent`
3. Overly complex participant ID extraction

These should be addressed immediately to prevent production issues. The other issues, while less critical, should be addressed in the short to medium term to improve code quality and maintainability.

