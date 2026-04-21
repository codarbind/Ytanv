import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { getApiErrorMessage } from '../api/axios';
import {
  enrollInCourse,
  fetchEnrollments,
  unenrollFromCourse,
} from '../api/services';
import type {
  Enrollment,
  PaginatedResponse,
} from '../types/api';

interface EnrollmentsContextValue {
  enrollments: PaginatedResponse<Enrollment> | null;
  isLoading: boolean;
  error: string | null;
  fetchEnrollmentsList: (page?: number, limit?: number) => Promise<void>;
  enrollInCourseById: (courseId: string) => Promise<{ success: boolean; message: string }>;
  unenrollFromCourseById: (enrollmentId: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const EnrollmentsContext = createContext<EnrollmentsContextValue | undefined>(undefined);

export function EnrollmentsProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<PaginatedResponse<Enrollment> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollmentsList = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchEnrollments(page, limit);
      setEnrollments(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourseById = async (courseId: string) => {
    try {
      setError(null);
      const result = await enrollInCourse(courseId);
      // Refresh the list if we have enrollments loaded
      if (enrollments) {
        await fetchEnrollmentsList(enrollments.meta.page, enrollments.meta.limit);
      }
      return { success: true, message: `Enrollment successful. Status: ${result.status}.` };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const unenrollFromCourseById = async (enrollmentId: string) => {
    try {
      setError(null);
      await unenrollFromCourse(enrollmentId);
      // Refresh the list if we have enrollments loaded
      if (enrollments) {
        await fetchEnrollmentsList(enrollments.meta.page, enrollments.meta.limit);
      }
      return { success: true, message: 'Unenrolled successfully.' };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: EnrollmentsContextValue = {
    enrollments,
    isLoading,
    error,
    fetchEnrollmentsList,
    enrollInCourseById,
    unenrollFromCourseById,
    clearError,
  };

  return (
    <EnrollmentsContext.Provider value={value}>
      {children}
    </EnrollmentsContext.Provider>
  );
}

export function useEnrollments() {
  const context = useContext(EnrollmentsContext);
  if (!context) {
    throw new Error('useEnrollments must be used within EnrollmentsProvider');
  }
  return context;
}