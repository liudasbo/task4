"use client";

import React, { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { FiUnlock, FiLock, FiTrash } from "react-icons/fi";

export function DataTable({ columns, data, refreshData }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);
  const { toast } = useToast();

  const tableColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
  });

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setColumnFilters([{ id: "email", value }]);
  };

  const handleBlock = async () => {
    const selectedEmails = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.email);

    if (selectedEmails.length === 0) {
      toast({
        title: "No selection",
        description: "Please select at least one user to block.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/users/block", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedEmails,
          status: "Blocked", //
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.message,
          description: "Users have been blocked successfully.",
        });
        refreshData();
      } else {
        toast({
          title: data.error,
          description: "Failed to block users.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: error,
        description: "An error occurred while blocking users:" + error,
        variant: "destructive",
      });
    }
  };

  const handleUnblock = async () => {
    const selectedEmails = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.email);

    if (selectedEmails.length === 0) {
      toast({
        title: "Please select at least one user.",
        description: "Please select at least one user to unblock.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/users/unblock", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedEmails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.message,
          description: "Users have been unblocked successfully.",
        });
        refreshData();
      } else {
        toast({
          title: data.error,
          description: "Failed to unblock users.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: error,
        description: "An error occurred while unblocking users:" + error,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    const selectedEmails = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.email);

    if (selectedEmails.length === 0) {
      toast({
        title: "Please select at least one user.",
        description: "Please select at least one user to delete.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedEmails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.message,
          description: "Users have been deleted successfully.",
        });
        refreshData();
      } else {
        toast({
          title: data.error,
          description: "Failed to delete users.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: error,
        description: "An error occurred while deleting users:" + error,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Toaster />
      <div className="mb-3 flex rounded-md">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBlock}>
            <FiLock /> Block
          </Button>
          <Button variant="outline" onClick={handleUnblock}>
            <FiUnlock />
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <FiTrash />
          </Button>
        </div>
        <Input
          placeholder="Filter emails..."
          value={
            columnFilters.find((filter) => filter.id === "email")?.value || ""
          }
          onChange={handleFilterChange}
          className="max-w-sm sm:ml-auto ml-2"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold bg-zinc-100">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
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
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex-1 text-sm text-muted-foreground mt-2">
        {table.getFilteredSelectedRowModel().rows.length} of {data.length}{" "}
        user(s) selected.
      </div>
    </div>
  );
}
