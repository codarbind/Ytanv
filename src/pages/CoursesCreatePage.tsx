import { useState, type FormEvent } from 'react';
import { useCourses } from '../context/CoursesContext';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function CoursesCreatePage() {
  const { createNewCourse, error, clearError } = useCourses();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    clearError();

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
      };

      // Client-side validation
      if (payload.title.length < 3) {
        throw new Error('Title must be at least 3 characters long');
      }
      if (payload.description.length < 5) {
        throw new Error('Description must be at least 5 characters long');
      }
      if (payload.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      const result = await createNewCourse(payload);
      if (result.success) {
        setSuccessMessage(result.message);
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
      }
    } catch (err) {
      // Error is handled in context or thrown above
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <section>
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Create New Course</h2>
          </div>
        </div>

        <form className="form-card course-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              required
              minLength={3}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              required
              minLength={5}
              rows={4}
            />
          </label>

          <label className="field">
            <span>Price ($)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              min="0.01"
              step="0.01"
            />
          </label>

          <FeedbackMessage type="error" message={error || undefined} />
          <FeedbackMessage type="success" message={successMessage} />

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Course...' : 'Create Course'}
          </button>
        </form>
      </section>
    </ProtectedRoute>
  );
}