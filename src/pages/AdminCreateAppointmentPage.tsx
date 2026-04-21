import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentsContext';
import { fetchPractitioners, fetchUsers } from '../api/services';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import type { Practitioner } from '../types/api';

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const normalizedDate = new Date(date.getTime() - offset * 60 * 1000);
  return normalizedDate.toISOString().slice(0, 16);
}

export function AdminCreateAppointmentPage() {
  const { user } = useAuth();
  const { createAppointmentForUser, error, clearError } = useAppointments();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dateTime, setDateTime] = useState(toDateTimeLocalValue(new Date()));
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const [practitionersData, usersData] = await Promise.all([
          fetchPractitioners(),
          fetchUsers(),
        ]);
        setPractitioners(practitionersData);
        setUsers(usersData);
        setSelectedPractitionerId(practitionersData[0]?.id ?? '');
        setSelectedUserId(usersData[0]?.id ?? '');
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  const helperText = useMemo(() => {
    if (isLoadingData) {
      return 'Loading practitioners and users...';
    }

    return 'Create an appointment for a user by selecting practitioner, user, and date/time.';
  }, [isLoadingData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    clearError();

    try {
      const payload = {
        userId: selectedUserId,
        practitionerId: selectedPractitionerId,
        dateTime: new Date(dateTime).toISOString(),
      };
      const result = await createAppointmentForUser(payload);
      if (result.success) {
        setSuccessMessage(result.message);
        // Reset form
        setDateTime(toDateTimeLocalValue(new Date()));
      }
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Create Appointment for User</h2>
          </div>
        </div>

        <form className="form-card appointment-form" onSubmit={handleSubmit}>
          <p className="helper-text">{helperText}</p>

          <label className="field">
            <span>User</span>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={isLoadingData}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Practitioner</span>
            <select
              value={selectedPractitionerId}
              onChange={(event) => setSelectedPractitionerId(event.target.value)}
              disabled={isLoadingData}
              required
            >
              {practitioners.map((practitioner) => (
                <option key={practitioner.id} value={practitioner.id}>
                  {practitioner.username}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Date and time</span>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              required
            />
          </label>

          <FeedbackMessage type="error" message={error || ''} />
          <FeedbackMessage type="success" message={successMessage} />

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting || isLoadingData}
          >
            {isSubmitting ? 'Creating...' : 'Create Appointment'}
          </button>
        </form>
      </section>
    </ProtectedRoute>
  );
}