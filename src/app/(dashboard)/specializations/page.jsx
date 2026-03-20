// app/(dashboard)/specializations/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useSpecializationStore } from "@/store/specializationStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import SpecializationForm from "@/components/specializations/SpecializationForm";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Stethoscope,
  Users,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SpecializationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 10,
  });

  const { isHydrated } = useAuthStore();
  const {
    specializations,
    pagination,
    loading,
    fetchSpecializations,
    deleteSpecialization,
  } = useSpecializationStore();

  // Fetch on mount and filter change
  useEffect(() => {
    if (isHydrated) {
      loadData();
    }
  }, [isHydrated, filters]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      if (isHydrated) {
        loadData();
      }
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadData = () => {
    fetchSpecializations({
      ...filters,
      search: searchInput,
      status: filters.status === "all" ? "" : filters.status,
    });
  };

  const handleEdit = (specialization) => {
    setSelectedSpecialization(specialization);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = await deleteSpecialization(deleteId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Specialization deleted successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedSpecialization(null);
    loadData();
  };

  // Show loading until hydrated
  if (!isHydrated) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specializations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage doctor specializations
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-neutral-900 hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Specialization
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search specializations..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value, page: 1 }))
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold text-center">Doctors</TableHead>
              <TableHead className="font-semibold text-center">Treatments</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : specializations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No specializations found
                </TableCell>
              </TableRow>
            ) : (
              specializations.map((spec) => (
                <TableRow key={spec.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{spec.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 max-w-xs truncate">
                    {spec.description || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                      <Users className="h-3 w-3 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {spec._count?.doctors || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                      <Stethoscope className="h-3 w-3 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">
                        {spec._count?.treatments || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        spec.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      {spec.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(spec)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(spec.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <SpecializationForm
          specialization={selectedSpecialization}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this specialization? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}