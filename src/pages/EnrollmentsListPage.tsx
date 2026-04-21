import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEnrollments } from '../context/EnrollmentsContext';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { PaginationComponent } from '../components/PaginationComponent';

export function EnrollmentsListPage() {
  const { user } = useAuth();
  const {
    enrollments,
    isLoading,
    error,
    fetchEnrollmentsList,
    unenrollFromCourseById,
  } = useEnrollments();

  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollmentsList();
  }, []);

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    setUnenrollingId(enrollmentId);
    await unenrollFromCourseById(enrollmentId);
    setUnenrollingId(null);
  };

  const canUnenroll = (enrollment: any) => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'USER') return enrollment.userId === user.userId;
    return false;
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Enrollments</p>
          <h2>My Enrollments</h2>
        </div>
      </div>

      <FeedbackMessage type="error" message={error || ''} />

      {isLoading ? (
        <div className="center-message">Loading enrollments...</div>
      ) : !enrollments ? (
        <div className="center-message">Failed to load enrollments.</div>
      ) : enrollments.items.length === 0 ? (
        <div className="empty-state">No enrollments found.</div>
      ) : (
        <>
          <div className="enrollments-list">
            {enrollments.items.map((enrollment) => (
              <div key={enrollment.id} className="enrollment-card">
                <div className="enrollment-info">
                  {enrollment.course ? (
                    <>
                      <h3>{enrollment.course.title}</h3>
                      <p>{enrollment.course.description}</p>
                      <div className="enrollment-price">${enrollment.course.price}</div>
                    </>
                  ) : (
                    <div>Course ID: {enrollment.courseId}</div>
                  )}
                  <div className="enrollment-status">
                    Status: <span className={`status-${enrollment.status.toLowerCase()}`}>
                      {enrollment.status}
                    </span>
                  </div>
                  <div className="enrollment-date">
                    Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="enrollment-actions">
                  {canUnenroll(enrollment) && (
                    <button
                      className="secondary-button"
                      onClick={() => handleUnenroll(enrollment.id)}
                      disabled={unenrollingId === enrollment.id}
                    >
                      {unenrollingId === enrollment.id ? 'Unenrolling...' : 'Unenroll'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <PaginationComponent
            data={enrollments}
            onPageChange={(page) => fetchEnrollmentsList(page, enrollments.meta.limit)}
            onLimitChange={(limit) => fetchEnrollmentsList(1, limit)}
          />
        </>
      )}
    </section>
  );
}