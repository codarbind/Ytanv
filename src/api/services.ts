import { api } from './axios';
import type {
  ApiResponse,
  Appointment,
  AssignPractitionerPayload,
  AuthResponse,
  Course,
  CreateAppointmentPayload,
  CreateCoursePayload,
  Enrollment,
  LoginPayload,
  PaginatedResponse,
  Practitioner,
  RegisterPayload,
  AdminCreateAppointmentPayload,
} from '../types/api';

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function fetchCourses(page = 1, limit = 10) {
  const { data } = await api.get<ApiResponse<Course[]>>(
    `/courses?page=${page}&limit=${limit}`
  );
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function createCourse(payload: CreateCoursePayload) {
  const { data } = await api.post<ApiResponse<Course>>('/courses', payload);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function fetchEnrollments(page = 1, limit = 10) {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Enrollment>>>(
    `/enrollments?page=${page}&limit=${limit}`
  );
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function unenrollFromCourse(enrollmentId: string) {
  const { data } = await api.delete<ApiResponse<void>>(`/enrollments/${enrollmentId}`);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function enrollInCourse(courseId: string) {
  const { data } = await api.post<ApiResponse<Enrollment>>('/enroll', { courseId });
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function fetchPractitioners() {
  const { data } = await api.get<ApiResponse<Practitioner[]>>('/users/practitioners');
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function fetchUsers() {
  const { data } = await api.get<ApiResponse<{ id: string; username: string }[]>>('/users');
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function fetchAppointments(page = 1, limit = 10) {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Appointment>>>(
    `/appointments?page=${page}&limit=${limit}`
  );
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const { data } = await api.post<ApiResponse<Appointment>>('/appointments', payload);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function createAppointmentForUser(payload: AdminCreateAppointmentPayload) {
  const { data } = await api.post<ApiResponse<Appointment>>('/appointments/admin', payload);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function cancelAppointment(appointmentId: string) {
  const { data } = await api.patch<ApiResponse<Appointment>>(`/appointments/${appointmentId}/cancel`);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}

export async function assignPractitionerToAppointment(
  appointmentId: string,
  payload: AssignPractitionerPayload
) {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/appointments/${appointmentId}/assign-practitioner`,
    payload
  );
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
}
