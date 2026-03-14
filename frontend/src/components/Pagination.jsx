
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages === 0) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center gap-3 mt-6">
      <span>Page {currentPage} of {totalPages}</span>
      <select
        value={currentPage}
        onChange={(e) => handlePageChange(Number(e.target.value))}
        className="border rounded px-2 py-1"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <option key={page} value={page}>{page}</option>
        ))}
      </select>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-400 text-white px-5 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-gray-400 text-white px-5 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;