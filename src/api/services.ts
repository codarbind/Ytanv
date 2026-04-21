import { api } from './axios';
import type {
  Appointment,
  AuthResponse,
  Course,
  CreateAppointmentPayload,
  Enrollment,
  LoginPayload,
  Practitioner,
  RegisterPayload,
} from '../types/api';

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<{ data: AuthResponse }>('/auth/login', payload);
  return data.data;
}

export async function fetchCourses() {
  const { data } = await api.get<{data: Course[]}>('/courses');
  return data.data;
}

export async function enrollInCourse(courseId: string) {
  const { data } = await api.post<Enrollment>('/enroll', { courseId });
  return data;
}

export async function fetchPractitioners() {
  const { data } = await api.get<{data: Practitioner[]}>('/users/practitioners');
  return data.data;
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const { data } = await api.post<{data: Appointment}>('/appointments', payload);
  return data.data;
}
