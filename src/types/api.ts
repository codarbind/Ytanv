export type UserRole = 'USER' | 'ADMIN' | 'PRACTITIONER';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  username: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  createdById: string;
  createdAt: string;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  price: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  course?: Course; // Optional populated course data
}

export interface Practitioner {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  practitionerId: string | null;
  dateTime: string;
  status: 'PENDING' | 'ASSIGNED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  practitioner?: Practitioner; // Optional populated practitioner data
  user?: { id: string; username: string }; // Optional populated user data for admin view
}

export interface CreateAppointmentPayload {
  practitionerId?: string;
  dateTime: string;
}

export interface AdminCreateAppointmentPayload {
  userId: string;
  practitionerId: string;
  dateTime: string;
}

export interface AssignPractitionerPayload {
  practitionerId: string;
}
