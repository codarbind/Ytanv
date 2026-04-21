# Vanty Frontend

Simple React frontend for the Vanty Learning & Service Booking Platform API. It includes:

- Authentication with register and login
- JWT persistence in `localStorage`
- Courses listing with enrollment
- Appointment booking with practitioner selection
- Axios API integration with automatic bearer token handling


## Tech Stack

- React
- Vite
- TypeScript
- Axios
- React Router

## Project Structure

```text
src/
  api/          Axios instance and API service calls
  components/   Shared UI pieces and route protection
  context/      Auth state and session persistence
  pages/        Auth, Courses, and Appointments pages
  types/        Shared API types
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
copy .env.example .env
```

3. Update `VITE_API_BASE_URL` in `.env` to point to your backend.

Example:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Run

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Backend Endpoints Used

- `POST /auth/register`
- `POST /auth/login`
- `GET /courses`
- `POST /enroll`
- `GET /users/practitioners`
- `POST /appointments`

## Notes

- If practitioner fetching fails, the appointment page falls back to a small mock list so the UI remains usable during frontend work.
- The Axios client automatically adds `Authorization: Bearer <token>` when a JWT is present.
- Error and success feedback are shown inline on each page.
