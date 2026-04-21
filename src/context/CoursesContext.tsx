import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { getApiErrorMessage } from '../api/axios';
import {
  createCourse,
  fetchCourses,
} from '../api/services';
import type {
  Course,
  CreateCoursePayload,
  PaginatedResponse,
} from '../types/api';

interface CoursesContextValue {
  courses: Course[] | null;
  isLoading: boolean;
  error: string | null;
  fetchCoursesList: (page?: number, limit?: number) => Promise<void>;
  createNewCourse: (payload: CreateCoursePayload) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const CoursesContext = createContext<CoursesContextValue | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoursesList = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCourses(page, limit);
      console.log('Fetched courses:', data);
      setCourses(data);
    } catch (err) {
        console.log({error})
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCourse = async (payload: CreateCoursePayload) => {
    try {
      setError(null);
      const result = await createCourse(payload);
      // Refresh the list if we have courses loaded
      if (courses) {
        await fetchCoursesList();
      }
      return { success: true, message: `Course "${result.title}" created successfully.` };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: CoursesContextValue = {
    courses,
    isLoading,
    error,
    fetchCoursesList,
    createNewCourse,
    clearError,
  };

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses must be used within CoursesProvider');
  }
  return context;
}