import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { EnrollmentsProvider } from '../context/EnrollmentsContext';
import { EnrollmentsListPage } from '../pages/EnrollmentsListPage';
import * as enrollmentsService from '../api/services';

vi.mock('../api/services');

const mockUser = {
  userId: 'user-1',
  username: 'John Doe',
  role: 'USER' as const,
  accessToken: 'token',
};

const mockEnrollments = {
  items: [
    {
      id: 'enr-1',
      userId: 'user-1',
      courseId: 'course-1',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      course: {
        id: 'course-1',
        title: 'React Basics',
        description: 'Learn React fundamentals',
        price: 49.99,
        createdById: 'admin-1',
        createdAt: new Date().toISOString(),
      },
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

const renderWithProviders = (component: React.ReactElement) => {
  localStorage.setItem('vanty_access_token', 'test-token');
  localStorage.setItem('vanty_user', JSON.stringify(mockUser));

  return render(
    <BrowserRouter>
      <AuthProvider>
        <EnrollmentsProvider>
          {component}
        </EnrollmentsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('EnrollmentsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );
    renderWithProviders(<EnrollmentsListPage />);
    expect(screen.getByText('Loading enrollments...')).toBeInTheDocument();
  });

  it('should display empty state when no enrollments found', async () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce({
      items: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });

    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No enrollments found.')).toBeInTheDocument();
    });
  });

  it('should display enrollments list with course details', async () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce(mockEnrollments);

    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Learn React fundamentals')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });
  });

  it('should display enrollment status', async () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce(mockEnrollments);

    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('USER should be able to unenroll from own enrollments', async () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce(mockEnrollments);
    
    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Unenroll')).toBeInTheDocument();
    });
  });

  it('should confirm before unenrolling', async () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce(mockEnrollments);
    vi.mocked(enrollmentsService.unenrollFromCourse).mockResolvedValueOnce(undefined as any);
    
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Unenroll')).toBeInTheDocument();
    });

    const unenrollButton = screen.getByText('Unenroll');
    fireEvent.click(unenrollButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(enrollmentsService.unenrollFromCourse).not.toHaveBeenCalled();
  });

  it('should handle unenroll successfully', async () => {
    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce(mockEnrollments);
    vi.mocked(enrollmentsService.unenrollFromCourse).mockResolvedValueOnce(undefined as any);
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Unenroll')).toBeInTheDocument();
    });

    const unenrollButton = screen.getByText('Unenroll');
    fireEvent.click(unenrollButton);

    await waitFor(() => {
      expect(enrollmentsService.unenrollFromCourse).toHaveBeenCalledWith('enr-1');
    });
  });

  it('should display pagination', async () => {
    const paginatedEnrollments = {
      ...mockEnrollments,
      meta: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    };

    vi.mocked(enrollmentsService.fetchEnrollments).mockResolvedValueOnce(paginatedEnrollments);

    renderWithProviders(<EnrollmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });
  });
});
