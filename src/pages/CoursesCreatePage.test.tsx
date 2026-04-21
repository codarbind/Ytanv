import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CoursesProvider } from '../context/CoursesContext';
import { CoursesCreatePage } from '../pages/CoursesCreatePage';
import * as coursesService from '../api/services';

vi.mock('../api/services');

const mockAdminUser = {
  userId: 'admin-1',
  username: 'Admin User',
  role: 'ADMIN' as const,
  accessToken: 'token',
};

const renderWithProviders = (component: React.ReactElement) => {
  localStorage.setItem('vanty_access_token', 'test-token');
  localStorage.setItem('vanty_user', JSON.stringify(mockAdminUser));

  return render(
    <BrowserRouter>
      <AuthProvider>
        <CoursesProvider>
          {component}
        </CoursesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CoursesCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create course form', () => {
    renderWithProviders(<CoursesCreatePage />);
    
    expect(screen.getByText('Create New Course')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
  });

  it('should show validation error for short title', async () => {
    renderWithProviders(<CoursesCreatePage />);
    
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
    const submitButton = screen.getByText('Create Course');

    fireEvent.change(titleInput, { target: { value: 'ab' } });
    fireEvent.change(descriptionInput, { target: { value: 'Valid description' } });
    
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(titleInput.validity.valid).toBe(false);
  });

  it('should show validation error for short description', async () => {
    renderWithProviders(<CoursesCreatePage />);
    
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
    const submitButton = screen.getByText('Create Course');

    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'abc' } });
    
    fireEvent.click(submitButton);

    expect(descriptionInput.validity.valid).toBe(false);
  });

  it('should show validation error for zero or negative price', async () => {
    renderWithProviders(<CoursesCreatePage />);
    
    const priceInput = screen.getByLabelText('Price ($)') as HTMLInputElement;
    const submitButton = screen.getByText('Create Course');

    fireEvent.change(priceInput, { target: { value: '0' } });
    fireEvent.click(submitButton);

    expect(priceInput.validity.valid).toBe(false);
  });

  it('should create course successfully', async () => {
    const mockCourse = {
      id: 'course-1',
      title: 'Advanced React',
      description: 'Learn advanced React patterns and techniques',
      price: 99.99,
      createdById: 'admin-1',
      createdAt: new Date().toISOString(),
    };

    vi.mocked(coursesService.createCourse).mockResolvedValueOnce(mockCourse);
    vi.mocked(coursesService.fetchCourses).mockResolvedValueOnce({
      items: [mockCourse],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithProviders(<CoursesCreatePage />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const priceInput = screen.getByLabelText('Price ($)');
    const submitButton = screen.getByText('Create Course');

    fireEvent.change(titleInput, { target: { value: 'Advanced React' } });
    fireEvent.change(descriptionInput, { target: { value: 'Learn advanced React patterns and techniques' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(coursesService.createCourse).toHaveBeenCalledWith({
        title: 'Advanced React',
        description: 'Learn advanced React patterns and techniques',
        price: 99.99,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Course "Advanced React" created successfully/)).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    vi.mocked(coursesService.createCourse).mockRejectedValueOnce(
      new Error('Failed to create course')
    );

    renderWithProviders(<CoursesCreatePage />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const priceInput = screen.getByLabelText('Price ($)');
    const submitButton = screen.getByText('Create Course');

    fireEvent.change(titleInput, { target: { value: 'Advanced React' } });
    fireEvent.change(descriptionInput, { target: { value: 'Learn advanced patterns' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    fireEvent.click(submitButton);

    await waitFor(() => {  
      expect(screen.getByText('Failed to create course')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
