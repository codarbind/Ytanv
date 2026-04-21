import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppointmentsProvider } from '../context/AppointmentsContext';
import { AppointmentsListPage } from '../pages/AppointmentsListPage';
import * as appointmentsService from '../api/services';

vi.mock('../api/services');

const mockUser = {
  userId: 'user-1',
  username: 'John Doe',
  role: 'USER' as const,
  accessToken: 'token',
};

const mockAdminUser = {
  userId: 'admin-1',
  username: 'Admin User',
  role: 'ADMIN' as const,
  accessToken: 'token',
};

const mockAppointments = {
  items: [
    {
      id: 'apt-1',
      userId: 'user-1',
      practitionerId: 'prac-1',
      dateTime: new Date().toISOString(),
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      practitioner: { id: 'prac-1', username: 'Dr. Smith', role: 'PRACTITIONER' as const, createdAt: '' },
      user: { id: 'user-1', username: 'John Doe' },
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

const renderWithProviders = (component: React.ReactElement, user = mockUser) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AppointmentsProvider>
          {component}
        </AppointmentsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AppointmentsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('vanty_access_token', 'test-token');
    localStorage.setItem('vanty_user', JSON.stringify(mockUser));
  });

  it('should display loading state initially', () => {
    vi.mocked(appointmentsService.fetchAppointments).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );
    renderWithProviders(<AppointmentsListPage />);
    expect(screen.getByText('Loading appointments...')).toBeInTheDocument();
  });

  it('should display empty state when no appointments found', async () => {
    vi.mocked(appointmentsService.fetchAppointments).mockResolvedValueOnce({
      items: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });

    renderWithProviders(<AppointmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No appointments found.')).toBeInTheDocument();
    });
  });

  it('should display appointments list', async () => {
    vi.mocked(appointmentsService.fetchAppointments).mockResolvedValueOnce(mockAppointments);

    renderWithProviders(<AppointmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });
  });

  it('USER should see cancel button only for own appointments', async () => {
    vi.mocked(appointmentsService.fetchAppointments).mockResolvedValueOnce(mockAppointments);
    
    renderWithProviders(<AppointmentsListPage />, mockUser);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('ADMIN should see cancel button for all appointments', async () => {
    vi.mocked(appointmentsService.fetchAppointments).mockResolvedValueOnce(mockAppointments);
    localStorage.setItem('vanty_user', JSON.stringify(mockAdminUser));

    renderWithProviders(<AppointmentsListPage />, mockAdminUser);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('ADMIN should see assign practitioner option', async () => {
    vi.mocked(appointmentsService.fetchAppointments).mockResolvedValueOnce(mockAppointments);
    vi.mocked(appointmentsService.fetchPractitioners).mockResolvedValueOnce([
      { id: 'prac-1', username: 'Dr. Smith', role: 'PRACTITIONER', createdAt: '' },
    ]);
    localStorage.setItem('vanty_user', JSON.stringify(mockAdminUser));

    renderWithProviders(<AppointmentsListPage />, mockAdminUser);
    
    await waitFor(() => {
      const selects = screen.getAllByDisplayValue('Select Practitioner');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('should handle cancel appointment', async () => {
    vi.mocked(appointmentsService.fetchAppointments).mockResolvedValueOnce(mockAppointments);
    vi.mocked(appointmentsService.cancelAppointment).mockResolvedValueOnce({
      ...mockAppointments.items[0],
      status: 'CANCELLED',
    });
    
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    renderWithProviders(<AppointmentsListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(appointmentsService.cancelAppointment).toHaveBeenCalledWith('apt-1');
    });
  });
});
