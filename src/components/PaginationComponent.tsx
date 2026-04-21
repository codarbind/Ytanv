import type { PaginatedResponse } from '../types/api';

interface PaginationComponentProps<T> {
  data: PaginatedResponse<T>;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showLimitSelector?: boolean;
}

export function PaginationComponent<T>({
  data,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
}: PaginationComponentProps<T>) {
  const { meta } = data;
  const { page, limit, total, totalPages } = meta;

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    onLimitChange?.(newLimit);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {Math.min((page - 1) * limit + 1, total)} to{' '}
        {Math.min(page * limit, total)} of {total} results
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={handlePrevious}
          disabled={page <= 1}
        >
          Previous
        </button>

        <span className="pagination-current">
          Page {page} of {totalPages}
        </span>

        <button
          className="pagination-button"
          onClick={handleNext}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      {showLimitSelector && onLimitChange && (
        <div className="pagination-limit">
          <label>
            Show:
            <select value={limit} onChange={handleLimitChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}