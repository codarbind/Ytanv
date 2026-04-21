# Frontend Integration Guide - Complete Implementation

## Overview

This guide documents the complete frontend integration with the backend API for appointment, enrollment, and course management features.

## Architecture

### State Management
- **AuthContext**: Manages user authentication and session
- **AppointmentsContext**: Manages appointments data and operations
- **EnrollmentsContext**: Manages enrollments data and operations
- **CoursesContext**: Manages courses data and operations

### API Layer (`src/api/services.ts`)

All API calls follow a standardized pattern:
1. Make request with axios
2. Validate `success` flag in response
3. Extract and return `data` field
4. Throw error if `success` is false

#### Key API Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

**Appointments**
- `GET /appointments?page=1&limit=10` - Fetch paginated appointments
- `POST /appointments` - Create appointment (USER)
- `POST /appointments/admin` - Create appointment for user (ADMIN)
- `PATCH /appointments/:id/cancel` - Cancel appointment
- `PATCH /appointments/:id/assign-practitioner` - Assign practitioner (ADMIN)

**Enrollments**
- `GET /enrollments?page=1&limit=10` - Fetch paginated enrollments
- `POST /enrollments` - Enroll in course
- `DELETE /enrollments/:id` - Unenroll from course
- `POST /enroll` - Legacy enroll endpoint (aliased to POST /enrollments)

**Courses**
- `GET /courses?page=1&limit=10` - Fetch paginated courses
- `POST /courses` - Create course (ADMIN only)

**Users**
- `GET /users` - Fetch all users
- `GET /users/practitioners` - Fetch all practitioners

### Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Components

### ProtectedRoute
- Enhanced with `allowedRoles` prop for role-based access control
- Redirects to home if user lacks required role
- Supports filtering: `<ProtectedRoute allowedRoles={['ADMIN']}>...</ProtectedRoute>`

### PaginationComponent
- Reusable pagination UI
- Supports page/limit changes
- Shows item count, current page, and optional limit selector
- Auto-hides when only one page exists

## Pages

### USER Pages

#### AppointmentPage (`/appointments`)
- Create appointment with practitioner selection
- Date/time picker with timezone handling
- Uses `AppointmentsContext`
- Success/error feedback messages

#### EnrollmentsListPage (`/enrollments`)
- View all personal enrollments
- Display course details (if populated)
- Unenroll with confirmation
- Pagination support
- Shows status (ACTIVE/COMPLETED)

### ADMIN Pages

#### AdminCreateAppointmentPage (`/appointments/create-for-user`)
- Create appointment for any user
- Select user from dropdown
- Select practitioner from dropdown
- Date/time picker

#### AppointmentsListPage (`/appointments/list`)
- View all appointments (or filtered by role)
- Display appointment details with status
- Cancel button for all appointments
- Assign practitioner for PENDING appointments
- Pagination support
- User info visible in admin view

#### CoursesCreatePage (`/courses/create`)
- Create new course
- Form fields: title, description, price
- Client-side validation:
  - Title: min 3 characters
  - Description: min 5 characters
  - Price: > 0
- Success/error feedback

### All-Users Page

#### CoursesPage (`/courses`)
- Browse available courses
- Enroll in courses
- Shows course card with: title, description, price
- Pagination support (fetches with limit=100)

## Context Hooks

### useAuth()
```typescript
interface useAuth {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  loginUser(payload): Promise<{success, message}>;
  registerUser(payload): Promise<{success, message}>;
  logout(): void;
}
```

### useAppointments()
```typescript
interface useAppointments {
  appointments: PaginatedResponse<Appointment> | null;
  isLoading: boolean;
  error: string | null;
  fetchAppointmentsList(page?, limit?): Promise<void>;
  createNewAppointment(payload): Promise<{success, message}>;
  createAppointmentForUser(payload): Promise<{success, message}>;
  cancelAppointmentById(id): Promise<{success, message}>;
  assignPractitioner(id, payload): Promise<{success, message}>;
  clearError(): void;
}
```

### useEnrollments()
```typescript
interface useEnrollments {
  enrollments: PaginatedResponse<Enrollment> | null;
  isLoading: boolean;
  error: string | null;
  fetchEnrollmentsList(page?, limit?): Promise<void>;
  enrollInCourseById(courseId): Promise<{success, message}>;
  unenrollFromCourseById(enrollmentId): Promise<{success, message}>;
  clearError(): void;
}
```

### useCourses()
```typescript
interface useCourses {
  courses: PaginatedResponse<Course> | null;
  isLoading: boolean;
  error: string | null;
  fetchCoursesList(page?, limit?): Promise<void>;
  createNewCourse(payload): Promise<{success, message}>;
  clearError(): void;
}
```

## Routing Structure

```
/auth                          - Login/Register page
/courses                       - Browse/enroll in courses (all users)
/courses/create                - Create course (ADMIN only)
/enrollments                   - View enrollments (all users)
/appointments                  - Book appointment (USER only)
/appointments/list             - View all appointments (ADMIN only)
/appointments/create-for-user  - Create appointment for user (ADMIN only)
```

## Role-Based Access Control

### USER Role
- Can book appointments (`/appointments`)
- Can view own enrollments (`/enrollments`)
- Can unenroll from courses
- Can browse and enroll in courses
- Can cancel own appointments

### ADMIN Role
- Can view all appointments (`/appointments/list`)
- Can create appointments for users (`/appointments/create-for-user`)
- Can create courses (`/courses/create`)
- Can view all enrollments
- Can cancel any appointment
- Can assign practitioners to appointments
- Can unenroll any user from courses

## Error Handling

All pages implement consistent error handling:
- 400: Validation errors shown inline
- 403: "Not authorized" message
- 404: "Not found" message
- 500: Generic error message
- Network errors: Handled by axios interceptor

Error messages flow from API → services → context → UI component

## Testing

### Test Files
- `AppointmentsListPage.test.tsx` - Appointment listing and cancellation
- `CoursesCreatePage.test.tsx` - Course creation with validation
- `EnrollmentsListPage.test.tsx` - Enrollment listing and unenrollment
- `PaginationComponent.test.tsx` - Pagination functionality

### Test Coverage Areas
1. **Role-based rendering** - Components render correctly per role
2. **API integration** - Services call correct endpoints
3. **Error handling** - Errors display properly
4. **User actions** - Cancel, assign, enroll flows work
5. **Pagination** - Page navigation and limit changes work
6. **Validation** - Form validation works as expected

### Running Tests
```bash
npm run test
```

## Type Safety

All types are defined in `src/types/api.ts`:
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated list response
- `Appointment`, `Enrollment`, `Course`, `Practitioner` - Domain models
- `UserRole` - 'USER' | 'ADMIN' | 'PRACTITIONER'

## Loading States

All pages implement loading states:
- Components show spinner/skeleton while fetching
- Buttons disabled during submission
- User feedback on pending operations

## Empty States

All list pages show empty messages:
- "No appointments found."
- "No enrollments found."
- "No courses available right now."

## Confirmation Modals

Critical actions require confirmation:
- Cancel appointment
- Unenroll from course

Uses native `window.confirm()` - can be upgraded to custom modal.

## Session Management

- Token stored in `localStorage` with key `vanty_access_token`
- User data stored in `localStorage` with key `vanty_user`
- Axios interceptor automatically adds Bearer token to requests
- Session restored on page reload

## Future Enhancements

1. **Custom Modal Component** - Replace window.confirm() with styled modal
2. **Toast Notifications** - Replace inline messages with toast library
3. **Real-time Updates** - WebSocket for live appointment/enrollment changes
4. **Search & Filtering** - Add search/filter to list pages
5. **Appointment Cancellation Reasons** - Track why appointments canceled
6. **Practitioner Availability** - Show availability calendar
7. **File Uploads** - Course materials, documents
8. **Ratings & Reviews** - User feedback on courses

## Debugging

### Enable Logging
Set `console.log()` in:
- Context hooks (mount/state changes)
- API services (request/response)
- Components (render/user actions)

### Common Issues

**1. Context not accessible**
```
Error: useAppointments must be used within AppointmentsProvider
```
Solution: Wrap component in respective Provider in App.tsx

**2. API response mismatch**
```
TypeError: Cannot read property 'items' of undefined
```
Solution: Check API endpoint returns `{ success, message, data: { items, meta } }`

**3. Unauthorized access**
```
403 Forbidden
```
Solution: Check role has permission for action, token is valid

**4. Pagination not updating**
```
Page stays at 1
```
Solution: Ensure onPageChange calls fetchList with correct page/limit

## Browser Compatibility

- Modern Chrome/Firefox/Safari/Edge
- Requires ES2020+ support
- LocalStorage required for auth persistence

## Performance Considerations

1. **Pagination** - Limits data fetched per request
2. **Lazy Loading** - Contexts only fetch on mount
3. **Memoization** - useAppointments/Enrollments/Courses memoized
4. **Request Caching** - Can be added with React Query

## Security Notes

1. **Bearer Token** - Sent in Authorization header automatically
2. **CORS** - Configured in axios baseURL
3. **XSS Prevention** - All user input sanitized by React
4. **CSRF** - Handled by backend
5. **Role Validation** - Both frontend (routing) and backend enforcement

## Access Token Refresh

Currently not implemented. To add:
1. Intercept 401 responses in axios
2. Call refresh endpoint
3. Retry original request
4. Update token in localStorage

Example:
```typescript
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      api.defaults.headers.Authorization = `Bearer ${newToken}`;
      return api.request(error.config);
    }
    throw error;
  }
);
```
