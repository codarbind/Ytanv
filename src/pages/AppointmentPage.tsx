import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentsContext';
import { fetchPractitioners } from '../api/services';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import type { Practitioner } from '../types/api';

const fallbackPractitioners: Practitioner[] = [
  {
    id: 'mock-practitioner-1',
    username: 'Dr. Mercy',
    role: 'PRACTITIONER',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-practitioner-2',
    username: 'Coach Daniel',
    role: 'PRACTITIONER',
    createdAt: new Date().toISOString(),
  },
];

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const normalizedDate = new Date(date.getTime() - offset * 60 * 1000);
  return normalizedDate.toISOString().slice(0, 16);
}

export function AppointmentPage() {
  const { user } = useAuth();
  const { createNewAppointment, error, clearError } = useAppointments();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');
  const [dateTime, setDateTime] = useState(toDateTimeLocalValue(new Date()));
  const [isLoadingPractitioners, setIsLoadingPractitioners] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadPractitioners() {
      try {
        setIsLoadingPractitioners(true);
        const data = await fetchPractitioners();
        const availablePractitioners = data.length > 0 ? data : fallbackPractitioners;
        // setPractitioners(availablePractitioners);
        // setSelectedPractitionerId(availablePractitioners[0]?.id ?? '');
      } catch {
        // setPractitioners(fallbackPractitioners);
        //setSelectedPractitionerId(fallbackPractitioners[0].id);
      } finally {
        setIsLoadingPractitioners(false);
      }
    }

    loadPractitioners();
  }, []);

  const helperText = useMemo(() => {
    if (isLoadingPractitioners) {
      return 'Loading practitioners...';
    }

    return 'Choose your preferred appointment time.';
  }, [isLoadingPractitioners]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    clearError();

    try {
      const payload = {
        // practitionerId: selectedPractitionerId,
        dateTime: new Date(dateTime).toISOString(),
      };
      const result = await createNewAppointment(payload);
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
    <ProtectedRoute allowedRoles={['USER']}>
      <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>Book a practitioner</h2>
        </div>
      </div>

      <form className="form-card appointment-form" onSubmit={handleSubmit}>
        <p className="helper-text">{helperText}</p>

        {/* <label className="field">
          <span>Practitioner</span>
          <select
            value={selectedPractitionerId}
            onChange={(event) => setSelectedPractitionerId(event.target.value)}
            disabled={isLoadingPractitioners}
            required
          >
            {practitioners.map((practitioner) => (
              <option key={practitioner.id} value={practitioner.id}>
                {practitioner.username}
              </option>
            ))}
          </select>
        </label> */}

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
          disabled={isSubmitting || isLoadingPractitioners}
        >
          {isSubmitting ? 'Booking...' : 'Book appointment'}
        </button>
      </form>
    </section>
    </ProtectedRoute>
  );
}
