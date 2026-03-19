export const dynamic = 'force-dynamic';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';

const DoctorForm = ({ doctor, onClose }) => {
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchTreatments();
    if (doctor) {
      setValue('name', doctor.user.name);
      setValue('email', doctor.user.email);
      setValue('phone', doctor.phone);
      setValue('specialization', doctor.specialization);
      setValue('experience', doctor.experience);
      setValue('address', doctor.address);
      setValue('status', doctor.status);
      setSelectedTreatments(doctor.treatments.map(t => t.treatmentId));
    }
  }, [doctor]);

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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('specialization', data.specialization);
      formData.append('experience', data.experience);
      formData.append('address', data.address || '');
      formData.append('treatmentIds', JSON.stringify(selectedTreatments));

      if (!doctor) {
        formData.append('password', data.password);
      }

      if (data.status) {
        formData.append('status', data.status);
      }

      if (data.profileImage?.[0]) {
        formData.append('profileImage', data.profileImage[0]);
      }

      if (doctor) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors/${doctor.id}`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast({
          title: 'Success',
          description: 'Doctor updated successfully'
        });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast({
          title: 'Success',
          description: 'Doctor created successfully'
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save doctor',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTreatment = (treatmentId) => {
    setSelectedTreatments(prev =>
      prev.includes(treatmentId)
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId]
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {doctor ? 'Edit Doctor' : 'Add Doctor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name"
              {...register('name', { required: true })}
            />
            {errors.name && <span className="text-red-500 text-sm">Required</span>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email"
              type="email"
              {...register('email', { required: true })}
            />
            {errors.email && <span className="text-red-500 text-sm">Required</span>}
          </div>

          {!doctor && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input 
                id="password"
                type="password"
                {...register('password', { required: !doctor })}
              />
              {errors.password && <span className="text-red-500 text-sm">Required</span>}
            </div>
          )}

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input 
              id="phone"
              {...register('phone', { required: true })}
            />
            {errors.phone && <span className="text-red-500 text-sm">Required</span>}
          </div>

          <div>
            <Label htmlFor="specialization">Specialization *</Label>
            <Input 
              id="specialization"
              {...register('specialization', { required: true })}
            />
            {errors.specialization && <span className="text-red-500 text-sm">Required</span>}
          </div>

          <div>
            <Label htmlFor="experience">Experience (years) *</Label>
            <Input 
              id="experience"
              type="number"
              {...register('experience', { required: true })}
            />
            {errors.experience && <span className="text-red-500 text-sm">Required</span>}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea 
              id="address"
              {...register('address')}
            />
          </div>

          <div>
            <Label htmlFor="profileImage">Profile Image</Label>
            <Input 
              id="profileImage"
              type="file"
              accept="image/*"
              {...register('profileImage')}
            />
          </div>

          {doctor && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                onValueChange={(value) => setValue('status', value)}
                defaultValue={doctor.status}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Treatments</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {treatments.map(treatment => (
                <div key={treatment.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`treatment-${treatment.id}`}
                    checked={selectedTreatments.includes(treatment.id)}
                    onCheckedChange={() => toggleTreatment(treatment.id)}
                  />
                  <label
                    htmlFor={`treatment-${treatment.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {treatment.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorForm;