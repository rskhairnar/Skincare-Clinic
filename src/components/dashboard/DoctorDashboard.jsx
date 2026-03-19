export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  UserCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800'
};

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDashboardData(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  const { stats, todayAppointments, upcomingAppointments } = dashboardData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, Dr. {user?.name}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                <p className="text-3xl font-bold">{stats.todayAppointments}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
                <p className="text-3xl font-bold">{stats.upcomingAppointments}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-3xl font-bold">{stats.totalPatients}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(appointment.dateTime), 'hh:mm a')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.treatment.name}</TableCell>
                    <TableCell>{appointment.treatment.duration} mins</TableCell>
                    <TableCell>
                      <Badge className={statusColors[appointment.status]}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div>{format(new Date(appointment.dateTime), 'MMM dd, yyyy')}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(appointment.dateTime), 'hh:mm a')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.treatment.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[appointment.status]}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;