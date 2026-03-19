'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Filter,
  Plus,
  Eye
} from 'lucide-react';
import AppointmentForm from './AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import { toast } from '@/components/ui/use-toast';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800'
};

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    doctorId: 'all',
    treatmentId: 'all',
    status: 'all',
    date: ''
  });
  const { token, user } = useAuthStore();

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchTreatments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.doctorId && filters.doctorId !== 'all') {
        params.append('doctorId', filters.doctorId);
      }
      if (filters.treatmentId && filters.treatmentId !== 'all') {
        params.append('treatmentId', filters.treatmentId);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.date) {
        params.append('date', filters.date);
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAppointments(response.data.appointments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTreatments(response.data.treatments);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: `Appointment ${status.toLowerCase()}`
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchAppointments();
  };

  const clearFilters = () => {
    setFilters({
      doctorId: 'all',
      treatmentId: 'all',
      status: 'all',
      date: ''
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Filters */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {user?.role === 'SUPER_ADMIN' && (
              <Select 
                value={filters.doctorId}
                onValueChange={(value) => setFilters({...filters, doctorId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select 
              value={filters.treatmentId}
              onValueChange={(value) => setFilters({...filters, treatmentId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Treatments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Treatments</SelectItem>
                {treatments.map(treatment => (
                  <SelectItem key={treatment.id} value={treatment.id.toString()}>
                    {treatment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.status}
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
            />

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.doctor.user.name}</TableCell>
                  <TableCell>{appointment.treatment.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div>{format(new Date(appointment.dateTime), 'MMM dd, yyyy')}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(appointment.dateTime), 'hh:mm a')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[appointment.status]}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {appointment.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600"
                            onClick={() => updateStatus(appointment.id, 'CONFIRMED')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600"
                            onClick={() => updateStatus(appointment.id, 'REJECTED')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {appointment.status === 'CONFIRMED' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-blue-600"
                          onClick={() => updateStatus(appointment.id, 'COMPLETED')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <AppointmentForm 
          doctors={doctors}
          treatments={treatments}
          onClose={handleFormClose}
        />
      )}

      {detailsOpen && selectedAppointment && (
        <AppointmentDetails 
          appointment={selectedAppointment}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  );
};

export default AppointmentList;