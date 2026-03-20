'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useDoctorStore } from '@/store/doctorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  X,
  Users,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DoctorForm from './DoctorForm';
import PaginationNew from '../ui/PaginationNew';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const DoctorList = () => {
  const { token } = useAuthStore();
  
  // Get state and actions from store
  const {
    doctors,
    loading,
    pagination,
    filters,
    isFormOpen,
    showFilters,
    specializations,
    specializationsLoading,
    getStats,
    fetchDoctors,
    fetchSpecializations,
    deleteDoctor,
    setPage,
    setSearch,
    setStatusFilter,
    setSpecializationFilter,
    clearFilters,
    hasActiveFilters,
    openForm,
    closeForm,
    toggleFilters,
  } = useDoctorStore();

  const stats = getStats();

  // Fetch doctors and specializations on mount
  useEffect(() => {
    if (token) {
      fetchDoctors(token);
      fetchSpecializations(token);
    }
  }, [token]);

  // Refetch when filters/pagination change
  useEffect(() => {
    if (token) {
      fetchDoctors(token);
    }
  }, [pagination.currentPage, filters.search, filters.status, filters.specializationId]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    const result = await deleteDoctor(id, token);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Doctor deleted successfully',
        variant: 'success',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  const handleFormClose = () => {
    closeForm();
    fetchDoctors(token);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'D';
  };

  const statsConfig = [
    {
      label: 'Total Doctors',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Active',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: UserX,
      color: 'bg-gray-50 text-gray-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your clinic's doctors and their profiles
          </p>
        </div>
        <Button 
          onClick={() => openForm()}
          className="bg-neutral-900 hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsConfig.map((stat) => (
          <div 
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className={cn("p-3 rounded-lg", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Filter Toggle - Mobile */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={toggleFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters() && (
              <Badge className="ml-2 bg-neutral-900 text-white">
                Active
              </Badge>
            )}
          </Button>

          {/* Filters - Desktop & Mobile */}
          <div className={cn(
            "flex flex-col sm:flex-row gap-3",
            "lg:flex",
            showFilters ? "flex" : "hidden lg:flex"
          )}>
            <Select value={filters.status} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-10 bg-gray-50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Updated Specialization Filter - Now uses ID */}
            <Select 
              value={filters.specializationId} 
              onValueChange={setSpecializationFilter}
            >
              <SelectTrigger className="w-full sm:w-48 h-10 bg-gray-50">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id.toString()}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters() && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchDoctors(token)}
              className="shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No doctors found</p>
            <p className="text-sm">
              {hasActiveFilters() 
                ? "Try adjusting your filters" 
                : "Add your first doctor to get started"
              }
            </p>
            {hasActiveFilters() && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Treatments
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.map((doctor) => (
                    <tr 
                      key={doctor.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={doctor.profileImage} />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                              {getInitials(doctor.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {doctor.user?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {doctor.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {/* FIX: Access specialization.name instead of specialization object */}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {doctor.specialization?.name || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">
                          {doctor.experience} years
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {doctor.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {doctor.treatments?.length || 0} treatments
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge 
                          className={cn(
                            "font-medium",
                            doctor.status === 'ACTIVE' 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          )}
                          variant="outline"
                        >
                          {doctor.status === 'ACTIVE' ? (
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            'Inactive'
                          )}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openForm(doctor)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(doctor.id)}
                            className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-gray-200">
                        <AvatarImage src={doctor.profileImage} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                          {getInitials(doctor.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {doctor.user?.name}
                        </p>
                        {/* FIX: Access specialization.name */}
                        <p className="text-sm text-gray-500">
                          {doctor.specialization?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openForm(doctor)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(doctor.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{doctor.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {doctor.phone}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                        {doctor.experience} yrs exp
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                        {doctor.treatments?.length || 0} treatments
                      </Badge>
                    </div>
                    <Badge 
                      className={cn(
                        "text-xs",
                        doctor.status === 'ACTIVE' 
                          ? "bg-green-50 text-green-700" 
                          : "bg-gray-50 text-gray-600"
                      )}
                      variant="outline"
                    >
                      {doctor.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-gray-500 hidden sm:block">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalDoctors)} of{' '}
                  {pagination.totalDoctors} doctors
                </p>
                <PaginationNew
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Doctor Form Modal */}
      {isFormOpen && (
        <DoctorForm 
          doctor={useDoctorStore.getState().selectedDoctor}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default DoctorList;