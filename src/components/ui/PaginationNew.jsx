import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PaginationNew = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const siblings = 1;

    pages.push(1);

    if (currentPage - siblings > 2) {
      pages.push("left-dots");
    }

    const start = Math.max(2, currentPage - siblings);
    const end = Math.min(totalPages - 1, currentPage + siblings);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage + siblings < totalPages - 1) {
      pages.push("right-dots");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "text-gray-600 hover:bg-gray-100",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        )}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          typeof page === "string" ? (
            <span
              key={page + index}
              className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200",
                currentPage === page
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "text-gray-600 hover:bg-gray-100",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PaginationNew;