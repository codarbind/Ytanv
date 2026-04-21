import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getApiErrorMessage } from '../api/axios';
import { createAppointment, fetchPractitioners } from '../api/services';
import { FeedbackMessage } from '../components/FeedbackMessage';
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
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');
  const [dateTime, setDateTime] = useState(toDateTimeLocalValue(new Date()));
  const [isLoadingPractitioners, setIsLoadingPractitioners] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadPractitioners() {
      try {
        setIsLoadingPractitioners(true);
        const data = await fetchPractitioners();
        const availablePractitioners = data.length > 0 ? data : fallbackPractitioners;
        setPractitioners(availablePractitioners);
        setSelectedPractitionerId(availablePractitioners[0]?.id ?? '');
      } catch {
        setPractitioners(fallbackPractitioners);
        setSelectedPractitionerId(fallbackPractitioners[0].id);
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

    return 'Choose a practitioner and preferred appointment time.';
  }, [isLoadingPractitioners]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        practitionerId: selectedPractitionerId,
        dateTime: new Date(dateTime).toISOString(),
      };
      const result = await createAppointment(payload);
      setSuccessMessage(
        `Appointment created successfully. Status: ${result.status}.`,
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>Book a practitioner</h2>
        </div>
      </div>

      <form className="form-card appointment-form" onSubmit={handleSubmit}>
        <p className="helper-text">{helperText}</p>

        <label className="field">
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

        <FeedbackMessage type="error" message={errorMessage} />
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
  );
}
