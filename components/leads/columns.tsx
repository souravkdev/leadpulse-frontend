import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lead } from "@/types/lead";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  PRIORITY_COLORS,
} from "@/types/lead";
import { format } from "date-fns";

interface ColumnActions {
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onLogActivity?: (lead: Lead) => void;
  canDelete?: boolean;
  canEdit?: (ownerId: string) => boolean;
}

export function buildColumns(actions: ColumnActions): ColumnDef<Lead>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Title
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium max-w-[200px] truncate block">
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "contact_name",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.getValue("contact_name")}</p>
          {row.original.company_name && (
            <p className="text-xs text-muted-foreground">
              {row.original.company_name}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => {
        const stage = row.getValue<string>("stage");
        return (
          <Badge
            variant="outline"
            className={`text-xs font-medium ${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}`}
          >
            {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue<string>("priority");
        return (
          <Badge
            variant="outline"
            className={`text-xs capitalize ${PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}`}
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          Value
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue<number | null>("value");
        if (!value) return <span className="text-muted-foreground">—</span>;
        return (
          <span>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(value)}
          </span>
        );
      },
    },
    {
      accessorKey: "assignee",
      header: "Assigned To",
      cell: ({ row }) => {
        const assignee = row.original.assignee;
        return assignee ? (
          <span className="text-sm">{assignee.full_name}</span>
        ) : (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => {
        const date = row.getValue<string>("updated_at");
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const lead = row.original;
        const canEdit = actions.canEdit?.(lead.created_by_id) ?? true;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => actions.onEdit?.(lead)}>
                    Edit lead
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => actions.onLogActivity?.(lead)}>
                Log activity
              </DropdownMenuItem>
              {actions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => actions.onDelete?.(lead)}
                  >
                    Delete lead
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
