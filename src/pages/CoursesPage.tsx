import { useEffect, useState } from 'react';
import { useCourses } from '../context/CoursesContext';
import { useEnrollments } from '../context/EnrollmentsContext';
import { FeedbackMessage } from '../components/FeedbackMessage';


export function CoursesPage() {
  const { courses, isLoading, error: coursesError, fetchCoursesList } = useCourses();
  const { enrollInCourseById, error: enrollError } = useEnrollments();
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  useEffect(() => {
    fetchCoursesList(1, 100); // Fetch first page with large limit for courses list
  }, []);

  async function handleEnroll(courseId: string) {
    setPendingCourseId(courseId);
    setSuccessMessage('');

    try {
      const result = await enrollInCourseById(courseId);
      if (result.success) {
        setSuccessMessage(result.message);
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setPendingCourseId(null);
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Courses</p>
          <h2>Available learning tracks</h2>
        </div>
      </div>

      <FeedbackMessage type="error" message={coursesError || enrollError || ''} />
      <FeedbackMessage type="success" message={successMessage} />

      {isLoading ? (
        <div className="center-message">Loading courses...</div>
      ) : !courses || courses.length === 0 ? (
        <div className="empty-state">No courses available right now.</div>
      ) : (
        <div className="card-grid">
          {courses.map((course) => (
            <article className="info-card" key={course.id}>
              <div className="card-header">
                <h3>{course.title}</h3>
                <span className="price-tag">${course.price}</span>
              </div>
              <p>{course.description}</p>
              <small>
                Created {new Date(course.createdAt).toLocaleDateString()}
              </small>
              <button
                className="primary-button"
                onClick={() => handleEnroll(course.id)}
                disabled={pendingCourseId === course.id}
              >
                {pendingCourseId === course.id ? 'Enrolling...' : 'Enroll'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
