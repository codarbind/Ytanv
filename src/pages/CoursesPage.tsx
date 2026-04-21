import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/axios';
import { enrollInCourse, fetchCourses } from '../api/services';
import { FeedbackMessage } from '../components/FeedbackMessage';
import type { Course } from '../types/api';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
console.log({ courses, isLoading, errorMessage, successMessage, pendingCourseId });
  useEffect(() => {
    async function loadCourses() {
      try {
        setIsLoading(true);
        const data = await fetchCourses();
        setCourses(data);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  async function handleEnroll(courseId: string) {
    setPendingCourseId(courseId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const enrollment = await enrollInCourse(courseId);
      setSuccessMessage(`Enrollment successful. Status: ${enrollment.status}.`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
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

      <FeedbackMessage type="error" message={errorMessage} />
      <FeedbackMessage type="success" message={successMessage} />

      {isLoading ? (
        <div className="center-message">Loading courses...</div>
      ) : courses.length === 0 ? (
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
