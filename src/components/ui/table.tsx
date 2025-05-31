import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowUpDown } from "lucide-react"

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  isStriped?: boolean
  isHoverable?: boolean
  isCompact?: boolean
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, isStriped, isHoverable = true, isCompact, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm",
          isCompact && "[&_td]:p-2 [&_th]:p-2 [&_th]:h-10",
          className
        )}
        {...props}
      />
    </div>
  )
)

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
  sortDirection?: "ascending" | "descending" | "none"
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection = "none", children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0",
        sortable && "cursor-pointer hover:bg-muted/20",
        className
      )}
      aria-sort={sortDirection}
      {...props}
    >
      {sortable ? (
        <div className="flex items-center gap-2">
          {children}
          <ArrowUpDown className="h-4 w-4 opacity-70" />
        </div>
      ) : (
        children
      )}
    </th>
  )
)

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    isSelected?: boolean
  }
>(({ className, isSelected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors",
      isSelected ? "bg-muted" : "hover:bg-muted/50",
      className
    )}
    {...props}
  />
))

// Export all components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
