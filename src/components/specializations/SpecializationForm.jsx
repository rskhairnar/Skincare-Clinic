// components/specializations/SpecializationForm.jsx

'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSpecializationStore } from '@/store/specializationStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { cn } from '@/lib/utils';
import { Stethoscope, FileText, Loader2 } from 'lucide-react';

const SpecializationForm = ({ specialization, onClose }) => {
  const [loading, setLoading] = useState(false);
  
  const { createSpecialization, updateSpecialization } = useSpecializationStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  // Populate form if editing
  useEffect(() => {
    if (specialization) {
      setValue('name', specialization.name);
      setValue('description', specialization.description || '');
      setValue('status', specialization.status);
    }
  }, [specialization, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      if (specialization) {
        result = await updateSpecialization(specialization.id, data);
      } else {
        result = await createSpecialization(data);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: specialization
            ? 'Specialization updated successfully'
            : 'Specialization created successfully',
          variant: 'success',
        });
        onClose();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save specialization',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save specialization',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {specialization ? 'Edit Specialization' : 'Add Specialization'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {specialization
              ? 'Update the specialization details'
              : 'Add a new specialization for doctors'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                placeholder="e.g., Dermatologist"
                className={cn(
                  'pl-10 h-10 bg-gray-50 border-gray-200',
                  errors.name && 'border-red-500 focus:ring-red-500'
                )}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                placeholder="Brief description of this specialization..."
                rows={3}
                className="pl-10 bg-gray-50 border-gray-200 resize-none"
                {...register('description')}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Active
                      </span>
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        Inactive
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-neutral-900 hover:bg-neutral-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {specialization ? 'Updating...' : 'Creating...'}
                </>
              ) : specialization ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpecializationForm;