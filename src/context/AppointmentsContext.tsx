import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { getApiErrorMessage } from '../api/axios';
import {
  assignPractitionerToAppointment,
  cancelAppointment,
  createAppointment,
  createAppointmentForUser,
  fetchAppointments,
} from '../api/services';
import type {
  AdminCreateAppointmentPayload,
  Appointment,
  AssignPractitionerPayload,
  CreateAppointmentPayload,
  PaginatedResponse,
} from '../types/api';

interface AppointmentsContextValue {
  appointments: PaginatedResponse<Appointment> | null;
  isLoading: boolean;
  error: string | null;
  fetchAppointmentsList: (page?: number, limit?: number) => Promise<void>;
  createNewAppointment: (payload: CreateAppointmentPayload) => Promise<{ success: boolean; message: string }>;
  createAppointmentForUser: (payload: AdminCreateAppointmentPayload) => Promise<{ success: boolean; message: string }>;
  cancelAppointmentById: (appointmentId: string) => Promise<{ success: boolean; message: string }>;
  assignPractitioner: (appointmentId: string, payload: AssignPractitionerPayload) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<PaginatedResponse<Appointment> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointmentsList = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAppointments(page, limit);
      setAppointments(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewAppointment = async (payload: CreateAppointmentPayload) => {
    try {
      setError(null);
      const result = await createAppointment(payload);
      // Refresh the list if we have appointments loaded
      if (appointments) {
        await fetchAppointmentsList(appointments.meta.page, appointments.meta.limit);
      }
      return { success: true, message: `Appointment created successfully. Status: ${result.status}.` };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const createAppointmentForUserAction = async (payload: AdminCreateAppointmentPayload) => {
    try {
      setError(null);
      const result = await createAppointmentForUser(payload);
      // Refresh the list if we have appointments loaded
      if (appointments) {
        await fetchAppointmentsList(appointments.meta.page, appointments.meta.limit);
      }
      return { success: true, message: `Appointment created successfully. Status: ${result.status}.` };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const cancelAppointmentById = async (appointmentId: string) => {
    try {
      setError(null);
      await cancelAppointment(appointmentId);
      // Refresh the list if we have appointments loaded
      if (appointments) {
        await fetchAppointmentsList(appointments.meta.page, appointments.meta.limit);
      }
      return { success: true, message: 'Appointment cancelled successfully.' };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const assignPractitioner = async (appointmentId: string, payload: AssignPractitionerPayload) => {
    try {
      setError(null);
      await assignPractitionerToAppointment(appointmentId, payload);
      // Refresh the list if we have appointments loaded
      if (appointments) {
        await fetchAppointmentsList(appointments.meta.page, appointments.meta.limit);
      }
      return { success: true, message: 'Practitioner assigned successfully.' };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AppointmentsContextValue = {
    appointments,
    isLoading,
    error,
    fetchAppointmentsList,
    createNewAppointment,
    createAppointmentForUser: createAppointmentForUserAction,
    cancelAppointmentById,
    assignPractitioner,
    clearError,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentsProvider');
  }
  return context;
}