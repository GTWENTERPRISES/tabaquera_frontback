import { useState, useMemo } from "react";
import type { QualityCheck } from "@/lib/types";

export function useQualityTable(filteredChecks: QualityCheck[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useMemo(() => {
    setCurrentPage(1);
  }, [filteredChecks.length]);

  const totalItems = filteredChecks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = filteredChecks.slice(startIndex, endIndex);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    startItem,
    endItem,
    handlePageChange,
    handlePageSizeChange,
  };
}
