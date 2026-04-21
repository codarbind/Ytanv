# Quick Reference Guide

## Route Map

| Route | Role | Component | Purpose |
|-------|------|-----------|---------|
| `/auth` | All | AuthPage | Login/Register |
| `/` | All | Redirect | Redirects to /courses or /auth |
| `/courses` | All | CoursesPage | Browse & enroll in courses |
| `/courses/create` | ADMIN | CoursesCreatePage | Create new course |
| `/enrollments` | All | EnrollmentsListPage | View personal enrollments |
| `/appointments` | USER | AppointmentPage | Book appointment |
| `/appointments/list` | ADMIN | AppointmentsListPage | View all appointments |
| `/appointments/create-for-user` | ADMIN | AdminCreateAppointmentPage | Create appt for user |

## API Endpoints Quick Reference

### Courses
```
GET    /courses?page=1&limit=10              → PaginatedResponse<Course>
POST   /courses                               → Course
       {title, description, price: number}
```

### Appointments
```
GET    /appointments?page=1&limit=10          → PaginatedResponse<Appointment>
POST   /appointments                          → Appointment
       {practitionerId, dateTime}
POST   /appointments/admin                    → Appointment
       {userId, practitionerId, dateTime}
PATCH  /appointments/:id/cancel               → Appointment
PATCH  /appointments/:id/assign-practitioner  → Appointment
       {practitionerId}
```

### Enrollments
```
GET    /enrollments?page=1&limit=10           → PaginatedResponse<Enrollment>
POST   /enrollments                           → Enrollment
       {courseId}
POST   /enroll (legacy)                       → Enrollment
DELETE /enrollments/:id                       → void
```

### Supporting
```
GET    /users                                 → {id, username}[]
GET    /users/practitioners                   → Practitioner[]
POST   /auth/login                            → AuthResponse
       {username, password}
POST   /auth/register                         → AuthResponse
       {username, password}
```

## Context Usage Examples

### useAppointments()
```typescript
// In component
const { appointments, isLoading, error, fetchAppointmentsList, cancelAppointmentById } = useAppointments();

// Fetch list
useEffect(() => {
  fetchAppointmentsList(1, 10); // page 1, limit 10
}, []);

// Render
{isLoading ? <Spinner /> : appointments?.items.map(...)}

// Action
const result = await cancelAppointmentById('apt-123');
if (result.success) { /* show success */ }
```

### useEnrollments()
```typescript
const { enrollments, enrollInCourseById, unenrollFromCourseById } = useEnrollments();

// Enroll
const result = await enrollInCourseById('course-456');
if (result.success) { /* refresh list */ }

// Unenroll
const result = await unenrollFromCourseById('enr-789');
if (result.success) { /* refresh list */ }
```

### useCourses()
```typescript
const { courses, createNewCourse, error } = useCourses();

// Create
const result = await createNewCourse({
  title: 'React Mastery',
  description: 'Advanced React patterns',
  price: 99.99
});

// Display error
{error && <ErrorMessage>{error}</ErrorMessage>}
```

### useAuth()
```typescript
const { user, loginUser, registerUser, logout } = useAuth();

// Login
const result = await loginUser({username: 'john', password: 'pass'});

// Check role
if (user?.role === 'ADMIN') { /* show admin UI */ }

// Logout
logout();
```

## Common Patterns

### Handle Paginated List
```typescript
const [page, setPage] = useState(1);
const { appointments, fetchAppointmentsList } = useAppointments();

useEffect(() => {
  fetchAppointmentsList(page, 10);
}, [page]);

return (
  <>
    {appointments?.items.map(item => ...)}
    <PaginationComponent
      data={appointments}
      onPageChange={setPage}
    />
  </>
);
```

### Handle Form Submission
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const { createNewCourse, error } = useCourses();

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  const result = await createNewCourse(payload);
  if (result.success) {
    setSuccessMessage(result.message);
    // Reset form
  }
  setIsSubmitting(false);
};

return (
  <form onSubmit={handleSubmit}>
    {/* fields */}
    <ErrorMessage>{error}</ErrorMessage>
    <button disabled={isSubmitting}>
      {isSubmitting ? 'Loading...' : 'Submit'}
    </button>
  </form>
);
```

### Role-Based Rendering
```typescript
const { user } = useAuth();

return (
  <>
    {user?.role === 'ADMIN' && (
      <AdminOnlyComponent />
    )}
    {user?.role === 'USER' && (
      <UserOnlyComponent />
    )}
    {['ADMIN', 'USER'].includes(user?.role || '') && (
      <SharedComponent />
    )}
  </>
);
```

### Protected Routes
```typescript
// In App.tsx routes
<Route
  path="/admin/courses/create"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <CoursesCreatePage />
    </ProtectedRoute>
  }
/>

// Or wrap full page component
<ProtectedRoute allowedRoles={['ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

## Validation Rules

### Course Creation
```
title:       min 3 characters
description: min 5 characters
price:       > 0
```

### Form Submission
All validation happens:
1. HTML5 built-in validation (form fields)
2. Client-side JS validation (before API call)
3. Backend validation (API returns 400 if fails)

## Error Handling Flow

```
API Call
  ↓
axios.interceptor (adds auth header)
  ↓
Service function
  ↓
Check response.success
  ├─ true  → return response.data
  └─ false → throw new Error(response.message)
  ↓
Context catch block
  ├─ Set error state
  └─ Return {success: false, message}
  ↓
Component
  ├─ Check result.success
  └─ Display error message
```

## Debugging Tips

### Enable debug logging
```typescript
// In services.ts
console.log('Fetching appointments:', {page, limit});
console.log('Response:', data);

// In contexts
console.log('Appointments updated:', appointments);

// In components
console.log('Render with:', {isLoading, error, data});
```

### Check localStorage state
```typescript
localStorage.getItem('vanty_access_token')
localStorage.getItem('vanty_user') // JSON
```

### Verify context providers
```typescript
// Error: useAppointments must be used within AppointmentsProvider
// Solution: Check App.tsx has <AppointmentsProvider>
```

### Check API response shape
```typescript
// Open DevTools → Network tab
// Click API request → Response
// Should see: {success: true, message: "...", data: {...}}
```

## Useful Dependencies

Already installed:
- `axios` - HTTP client with interceptors
- `react-router-dom` - Routing
- `react` - UI library

Recommended to add:
- `react-query` - Caching & syncing
- `react-hot-toast` - Toast notifications
- `zod` or `yup` - Advanced validation
- `date-fns` - Date handling
- `lodash` - Utility functions

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Context is undefined | Provider missing | Add Provider in App.tsx |
| 401 Unauthorized | No token/expired | Login again, clear localStorage |
| Cannot read undefined items | Response format wrong | Check API returns {data: {items, meta}} |
| Page doesn't update | Missing dependency | Add fetchList to useEffect dependency array |
| Pagination broken | Limit not matching items | Verify API returns correct total/totalPages |
| Role check not working | User not loaded yet | Check useAuth().isBootstrapping |

## Performance Notes

- Pagination limits database queries
- Each context fetch only on mount (unless manual trigger)
- No re-renders unless state actually changes
- Consider React Query for cache management

## Security Reminders

- Always validate on backend (frontend validation optional)
- Token in localStorage accessible via XSS
- Implement token refresh for long sessions
- CORS must be configured server-side
- Never commit secrets/tokens to git
