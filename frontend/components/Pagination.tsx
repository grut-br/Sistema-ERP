import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationProps) {
  return (
    <div className="pagination">
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      <span className="pagination-info">
        Página: {currentPage} de {totalPages || 1}
      </span>
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        &gt;
      </button>
      <div className="pagination-controls">
        <span>Linhas na página:</span>
        <select 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="pagination-select"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  )
}
