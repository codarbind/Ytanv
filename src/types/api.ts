export type UserRole = 'USER' | 'ADMIN' | 'PRACTITIONER';

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
  price: string;
  createdById: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
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
  practitionerId: string;
  dateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface CreateAppointmentPayload {
  practitionerId: string;
  dateTime: string;
}
