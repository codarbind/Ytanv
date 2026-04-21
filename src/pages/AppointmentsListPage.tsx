import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentsContext';
import { fetchPractitioners, fetchUsers } from '../api/services';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { PaginationComponent } from '../components/PaginationComponent';
import type { Practitioner } from '../types/api';

export function AppointmentsListPage() {
  const { user } = useAuth();
  const {
    appointments,
    isLoading,
    error,
    fetchAppointmentsList,
    cancelAppointmentById,
    assignPractitioner,
  } = useAppointments();

  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');
  const [assigningAppointmentId, setAssigningAppointmentId] = useState<string | null>(null);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointmentsList();
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      // Load practitioners and users for admin features
      fetchPractitioners().then(setPractitioners).catch(() => {});
      fetchUsers().then(setUsers).catch(() => {});
    } else if (user?.role === 'USER') {
      // Load practitioners for user to see assigned ones
      fetchPractitioners().then(setPractitioners).catch(() => {});
    }
  }, [user?.role]);

  const handleCancel = async (appointmentId: string) => {
    setCancellingAppointmentId(appointmentId);
    const result = await cancelAppointmentById(appointmentId);
    if (!result.success) {
      // Error is already set in context
    }
    setCancellingAppointmentId(null);
  };

  const handleAssignPractitioner = async (appointmentId: string) => {
    if (!selectedPractitionerId) return;

    setAssigningAppointmentId(appointmentId);
    const result = await assignPractitioner(appointmentId, { practitionerId: selectedPractitionerId });
    if (result.success) {
      setSelectedPractitionerId('');
    }
    setAssigningAppointmentId(null);
  };

  const canCancelAppointment = (appointment: any) => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'USER') return appointment.userId === user.userId;
    return false;
  };

  const canAssignPractitioner = user?.role === 'ADMIN';

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>All Appointments</h2>
        </div>
      </div>

      <FeedbackMessage type="error" message={error || undefined} />

      {isLoading ? (
        <div className="center-message">Loading appointments...</div>
      ) : !appointments ? (
        <div className="center-message">Failed to load appointments.</div>
      ) : appointments.items.length === 0 ? (
        <div className="empty-state">No appointments found.</div>
      ) : (
        <>
          <div className="appointments-list">
            {appointments.items.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-info">
                  <div className="appointment-date">
                    {new Date(appointment.dateTime).toLocaleString()}
                  </div>
                  <div className="appointment-status">
                    Status: <span className={`status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.practitioner && (
                    <div className="appointment-practitioner">
                      Practitioner: {appointment.practitioner.username}
                    </div>
                  )}
                  {user?.role === 'ADMIN' && appointment.user && (
                    <div className="appointment-user">
                      User: {appointment.user.username}
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {canCancelAppointment(appointment) && (
                    <button
                      className="secondary-button"
                      onClick={() => handleCancel(appointment.id)}
                      disabled={cancellingAppointmentId === appointment.id}
                    >
                      {cancellingAppointmentId === appointment.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}

                  {canAssignPractitioner && appointment.status === 'PENDING' && (
                    <div className="assign-practitioner">
                      <select
                        value={selectedPractitionerId}
                        onChange={(e) => setSelectedPractitionerId(e.target.value)}
                      >
                        <option value="">Select Practitioner</option>
                        {practitioners.map((practitioner) => (
                          <option key={practitioner.id} value={practitioner.id}>
                            {practitioner.username}
                          </option>
                        ))}
                      </select>
                      <button
                        className="primary-button"
                        onClick={() => handleAssignPractitioner(appointment.id)}
                        disabled={!selectedPractitionerId || assigningAppointmentId === appointment.id}
                      >
                        {assigningAppointmentId === appointment.id ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <PaginationComponent
            data={appointments}
            onPageChange={(page) => fetchAppointmentsList(page, appointments.meta.limit)}
            onLimitChange={(limit) => fetchAppointmentsList(1, limit)}
          />
        </>
      )}
    </section>
  );
}