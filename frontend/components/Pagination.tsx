'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const numbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      if (currentPage > 2) {
        numbers.push(1);
      }
      if (currentPage > 3) {
        numbers.push('...');
      }
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
        if (!numbers.includes(i)) numbers.push(i);
      }
      if (currentPage < totalPages - 2) {
        numbers.push('...');
      }
      if (currentPage < totalPages - 1) {
        numbers.push(totalPages);
      }
    }
    return numbers;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Previous Button */}
      <Link
        href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
        className={`pagination-button inactive ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        ←
      </Link>

      {/* Page Numbers */}
      {getPageNumbers().map((num, idx) => (
        <div key={idx}>
          {num === '...' ? (
            <span className="px-2">...</span>
          ) : (
            <Link
              href={`${baseUrl}?page=${num}`}
              className={`pagination-button ${
                num === currentPage ? 'active' : 'inactive'
              }`}
            >
              {num}
            </Link>
          )}
        </div>
      ))}

      {/* Next Button */}
      <Link
        href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
        className={`pagination-button inactive ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        →
      </Link>
    </div>
  );
}
