import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaginationComponent } from '../components/PaginationComponent';
import type { PaginatedResponse } from '../types/api';

describe('PaginationComponent', () => {
  const mockData: PaginatedResponse<any> = {
    items: [],
    meta: {
      page: 2,
      limit: 10,
      total: 50,
      totalPages: 5,
    },
  };

  it('should render pagination controls', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationComponent data={mockData} onPageChange={onPageChange} />
    );
    
    expect(screen.getByText(/Previous/)).toBeInTheDocument();
    expect(screen.getByText(/Next/)).toBeInTheDocument();
    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
  });

  it('should display correct item count info', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationComponent data={mockData} onPageChange={onPageChange} />
    );
    
    expect(screen.getByText(/Showing 11 to 20 of 50/)).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    const onPageChange = vi.fn();
    const firstPageData: PaginatedResponse<any> = {
      ...mockData,
      meta: { ...mockData.meta, page: 1 },
    };
    
    const { getByText } = render(
      <PaginationComponent data={firstPageData} onPageChange={onPageChange} />
    );
    
    const prevButton = getByText('Previous') as HTMLButtonElement;
    expect(prevButton.disabled).toBe(true);
  });

  it('should disable Next button on last page', () => {
    const onPageChange = vi.fn();
    const lastPageData: PaginatedResponse<any> = {
      ...mockData,
      meta: { ...mockData.meta, page: 5, totalPages: 5 },
    };
    
    const { getByText } = render(
      <PaginationComponent data={lastPageData} onPageChange={onPageChange} />
    );
    
    const nextButton = getByText('Next') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  it('should render limit selector when showLimitSelector is true', () => {
    const onPageChange = vi.fn();
    const onLimitChange = vi.fn();
    
    render(
      <PaginationComponent
        data={mockData}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        showLimitSelector={true}
      />
    );
    
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('should not render any pagination for single page', () => {
    const onPageChange = vi.fn();
    const singlePageData: PaginatedResponse<any> = {
      ...mockData,
      meta: { ...mockData.meta, page: 1, totalPages: 1 },
    };
    
    const { container } = render(
      <PaginationComponent data={singlePageData} onPageChange={onPageChange} />
    );
    
    expect(container.querySelector('.pagination')).not.toBeInTheDocument();
  });

  it('should calculate correct item range for last page', () => {
    const onPageChange = vi.fn();
    const lastPageData: PaginatedResponse<any> = {
      ...mockData,
      meta: { ...mockData.meta, page: 5, totalPages: 5, total: 50 },
    };
    
    render(
      <PaginationComponent data={lastPageData} onPageChange={onPageChange} />
    );
    
    expect(screen.getByText(/Showing 41 to 50 of 50/)).toBeInTheDocument();
  });
});
