
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const AppointmentForm = ({ doctors, treatments, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const { token } = useAuthStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    setValue('doctorId', doctorId);
    
    const doctor = doctors.find(d => d.id.toString() === doctorId);
    if (doctor) {
      const doctorTreatmentIds = doctor.treatments.map(t => t.treatmentId);
      const filtered = treatments.filter(t => doctorTreatmentIds.includes(t.id));
      setFilteredTreatments(filtered);
    } else {
      setFilteredTreatments([]);
    }
    // Reset treatment selection when doctor changes
    setValue('treatmentId', '');
  };

  const onSubmit = async (data) => {
    if (!data.doctorId || !data.treatmentId) {
      toast({
        title: 'Error',
        description: 'Please select doctor and treatment',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: 'Appointment created successfully'
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create appointment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input 
              id="patientName"
              placeholder="Enter patient name"
              {...register('patientName', { required: 'Patient name is required' })}
            />
            {errors.patientName && (
              <span className="text-red-500 text-sm">{errors.patientName.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="patientPhone">Phone Number *</Label>
            <Input 
              id="patientPhone"
              placeholder="Enter phone number"
              {...register('patientPhone', { required: 'Phone number is required' })}
            />
            {errors.patientPhone && (
              <span className="text-red-500 text-sm">{errors.patientPhone.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="patientEmail">Email</Label>
            <Input 
              id="patientEmail"
              type="email"
              placeholder="Enter email (optional)"
              {...register('patientEmail')}
            />
          </div>

          <div>
            <Label htmlFor="doctorId">Doctor *</Label>
            <Select onValueChange={handleDoctorChange} value={selectedDoctor || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.user.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="treatmentId">Treatment *</Label>
            <Select 
              onValueChange={(value) => setValue('treatmentId', value)}
              disabled={!selectedDoctor}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedDoctor ? "Select treatment" : "Select doctor first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTreatments.map(treatment => (
                  <SelectItem key={treatment.id} value={treatment.id.toString()}>
                    {treatment.name} - ${treatment.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateTime">Date & Time *</Label>
            <Input 
              id="dateTime"
              type="datetime-local"
              {...register('dateTime', { required: 'Date and time is required' })}
            />
            {errors.dateTime && (
              <span className="text-red-500 text-sm">{errors.dateTime.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              placeholder="Additional notes..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;