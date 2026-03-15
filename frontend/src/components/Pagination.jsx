
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages === 0) return null;

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < totalPages;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [1, "ellipsis-left", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      "ellipsis-left",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  };

  const visiblePages = getVisiblePages();

  const navigationButtonClassName = "inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400";
  const pageButtonClassName = (page) => `inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
    page === safeCurrentPage
      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
  }`;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Page {safeCurrentPage}</span> of {totalPages}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between lg:justify-end">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={!canGoPrevious}
              className={navigationButtonClassName}
              aria-label="Go to first page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={!canGoPrevious}
              className={navigationButtonClassName}
              aria-label="Go to previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {visiblePages.map((page) => {
              if (typeof page !== "number") {
                return (
                  <span key={page} className="inline-flex h-10 min-w-10 items-center justify-center text-sm font-medium text-slate-400">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={pageButtonClassName(page)}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={!canGoNext}
              className={navigationButtonClassName}
              aria-label="Go to next page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={!canGoNext}
              className={navigationButtonClassName}
              aria-label="Go to last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <label htmlFor="pagination-page-select" className="font-medium text-slate-700">
              Go to page
            </label>
            <select
              id="pagination-page-select"
              value={safeCurrentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <option key={page} value={page}>{page}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pagination;