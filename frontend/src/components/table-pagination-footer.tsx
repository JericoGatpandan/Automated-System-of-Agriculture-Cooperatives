import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationFooterProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    items.push("ellipsis");
  }

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }

  if (endPage < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);
  return items;
}

export function TablePaginationFooter({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  className,
}: TablePaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = totalCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const end =
    totalCount === 0 ? 0 : Math.min(safeCurrentPage * pageSize, totalCount);
  const pageItems = buildPageItems(safeCurrentPage, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalCount} results
      </p>

      {totalCount > 0 && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex flex-wrap items-center gap-1">
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === safeCurrentPage ? "default" : "outline"}
                  size="xs"
                  className="min-w-8"
                  onClick={() => onPageChange(item)}
                  aria-current={item === safeCurrentPage ? "page" : undefined}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
