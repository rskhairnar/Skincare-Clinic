export const dynamic = 'force-dynamic';
'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Stethoscope,
  FileText
} from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800'
};

const AppointmentDetails = ({ appointment, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Appointment Details</span>
            <Badge className={statusColors[appointment.status]}>
              {appointment.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{appointment.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{appointment.patientPhone}</span>
              </div>
              {appointment.patientEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{appointment.patientEmail}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Appointment Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Appointment Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{format(new Date(appointment.dateTime), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{format(new Date(appointment.dateTime), 'hh:mm a')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Doctor & Treatment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Doctor & Treatment</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{appointment.doctor.user.name}</div>
                  <div className="text-sm text-gray-500">{appointment.doctor.specialization}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{appointment.treatment.name}</div>
                  <div className="text-sm text-gray-500">
                    {appointment.treatment.duration} mins - ${appointment.treatment.price}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Notes</h3>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-700">{appointment.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetails;