"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Search, Plus, Filter, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { buildColumns } from "./columns";
import type { Lead, LeadStage } from "@/types/lead";
import { STAGE_LABELS, STAGE_ORDER } from "@/types/lead";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";

interface LeadsDataTableProps {
  onCreateNew?: () => void;
  onEdit?: (lead: Lead) => void;
  onLogActivity?: (lead: Lead) => void;
}

export function LeadsDataTable({ onCreateNew, onEdit, onLogActivity }: LeadsDataTableProps) {
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState<LeadStage | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { canDeleteLead, canCreateLead, canEditLead } = usePermissions();
  const deleteLead = useDeleteLead();

  const { data, isLoading } = useLeads({
    page,
    page_size: 20,
    stage: stageFilter || undefined,
    search: debouncedSearch || undefined,
  });

  // Debounce search input
  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout((window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer);
    (window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  }

  async function handleDelete(lead: Lead) {
    if (!confirm(`Delete lead "${lead.title}"?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  const columns = buildColumns({
    onEdit,
    onDelete: handleDelete,
    onLogActivity,
    canDelete: canDeleteLead(),
    canEdit: canEditLead,
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    manualPagination: true,
    pageCount: data?.total_pages ?? 1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: 20 },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={stageFilter || "all"}
          onValueChange={(v) => {
            setStageFilter(v === "all" ? "" : (v as LeadStage));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGE_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {STAGE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors">
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id.replace(/_/g, " ")}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {canCreateLead() && (
          <Button size="sm" onClick={onCreateNew} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {Object.keys(rowSelection).length > 0
            ? `${Object.keys(rowSelection).length} of ${data?.total ?? 0} row(s) selected`
            : `${data?.total ?? 0} total leads`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {page} of {data?.total_pages ?? 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(data?.total_pages ?? 1, p + 1))
            }
            disabled={page >= (data?.total_pages ?? 1) || isLoading}
          >
            {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
