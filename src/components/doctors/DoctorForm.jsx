'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useDoctorStore } from '@/store/doctorStore';
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
import { SimpleMultiSelect } from '@/components/ui/SimpleMultiSelect';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Briefcase, 
  Clock, 
  MapPin, 
  ImagePlus,
  X,
  Loader2,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

const DoctorForm = ({ doctor, onClose }) => {
  const [allTreatments, setAllTreatments] = useState([]); // All treatments from API
  const [filteredTreatments, setFilteredTreatments] = useState([]); // Filtered by specialization
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTreatments, setFetchingTreatments] = useState(true);
  const [fetchingSpecializations, setFetchingSpecializations] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { createDoctor, updateDoctor } = useDoctorStore();
  const { specializations, fetchSpecializations } = useSpecializationStore();
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    control,
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      specializationId: '',
      experience: '',
      address: '',
      status: 'ACTIVE',
    }
  });

  const watchImage = watch('profileImage');
  const watchSpecializationId = watch('specializationId'); // Watch specialization changes

  // Fetch specializations on mount
  useEffect(() => {
    const loadSpecializations = async () => {
      setFetchingSpecializations(true);
      await fetchSpecializations({ all: true });
      setFetchingSpecializations(false);
    };
    loadSpecializations();
  }, []);

  // Fetch all treatments on mount
  useEffect(() => {
    fetchTreatments();
  }, []);

  // Filter treatments when specialization changes
  useEffect(() => {
    if (watchSpecializationId && allTreatments.length > 0) {
      const specId = parseInt(watchSpecializationId);
      const filtered = allTreatments.filter(t => t.specializationId === specId);
      setFilteredTreatments(filtered);
      
      // Only clear selected treatments if we're not in edit mode or if specialization changed
      if (!doctor) {
        setSelectedTreatments([]);
      } else {
        // In edit mode, keep only treatments that belong to the new specialization
        const validTreatmentIds = filtered.map(t => t.id);
        setSelectedTreatments(prev => prev.filter(id => validTreatmentIds.includes(id)));
      }
    } else {
      setFilteredTreatments([]);
    }
  }, [watchSpecializationId, allTreatments]);

  // Populate form if editing
  useEffect(() => {
    if (doctor) {
      setValue('name', doctor.user?.name || '');
      setValue('email', doctor.user?.email || '');
      setValue('phone', doctor.phone || '');
      setValue('specializationId', doctor.specializationId?.toString() || doctor.specialization?.id?.toString() || '');
      setValue('experience', doctor.experience?.toString() || '');
      setValue('address', doctor.address || '');
      setValue('status', doctor.status || 'ACTIVE');
      
      // Set selected treatments
      const treatmentIds = doctor.treatments?.map(t => t.treatmentId || t.treatment?.id) || [];
      setSelectedTreatments(treatmentIds.filter(Boolean));
      
      if (doctor.profileImage) {
        setImagePreview(doctor.profileImage);
      }
    }
  }, [doctor, setValue]);

  // Handle image preview
  useEffect(() => {
    if (watchImage?.[0]) {
      const file = watchImage[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [watchImage]);

  const fetchTreatments = async () => {
    setFetchingTreatments(true);
    try {
      const response = await api.get('/treatments?all=true');
      setAllTreatments(response.data.treatments || []);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Warning',
        description: 'Failed to load treatments',
        variant: 'destructive'
      });
    } finally {
      setFetchingTreatments(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('specializationId', data.specializationId);
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

      let result;
      if (doctor) {
        result = await updateDoctor(doctor.id, formData);
      } else {
        result = await createDoctor(formData);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: doctor ? 'Doctor updated successfully' : 'Doctor created successfully',
          variant: 'success',
        });
        onClose();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save doctor',
          variant: 'destructive'
        });
      }
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

  const removeImage = () => {
    setValue('profileImage', null);
    setImagePreview(null);
  };

  // Transform filtered treatments for SimpleMultiSelect
  const treatmentOptions = filteredTreatments.map(t => ({
    value: t.id,
    label: t.name,
    description: `${t.duration} min - $${t.price}`
  }));

  // Get selected specialization name for display
  const selectedSpecialization = specializations.find(
    s => s.id.toString() === watchSpecializationId
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {doctor ? 'Edit Doctor' : 'Add New Doctor'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {doctor 
              ? 'Update the doctor\'s information below' 
              : 'Fill in the details to add a new doctor to your clinic'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              
              {/* Profile Image Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-medium text-gray-900">Profile Photo</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <ImagePlus className="h-4 w-4" />
                      {imagePreview ? 'Change Photo' : 'Upload Photo'}
                    </div>
                    <Input 
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register('profileImage')}
                    />
                  </Label>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="name"
                        placeholder="Dr. John Smith"
                        className={cn(
                          "pl-10 h-10 bg-gray-50 border-gray-200",
                          errors.name && "border-red-500 focus:ring-red-500"
                        )}
                        {...register('name', { required: 'Name is required' })}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email"
                        type="email"
                        placeholder="doctor@clinic.com"
                        className={cn(
                          "pl-10 h-10 bg-gray-50 border-gray-200",
                          errors.email && "border-red-500 focus:ring-red-500"
                        )}
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password - Only for new doctors */}
                  {!doctor && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className={cn(
                            "pl-10 h-10 bg-gray-50 border-gray-200",
                            errors.password && "border-red-500 focus:ring-red-500"
                          )}
                          {...register('password', { 
                            required: !doctor && 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            }
                          })}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                      )}
                    </div>
                  )}

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        className={cn(
                          "pl-10 h-10 bg-gray-50 border-gray-200",
                          errors.phone && "border-red-500 focus:ring-red-500"
                        )}
                        {...register('phone', { required: 'Phone is required' })}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Specialization - FULL WIDTH */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specializationId" className="text-sm font-medium text-gray-700">
                      Specialization <span className="text-red-500">*</span>
                    </Label>
                    {fetchingSpecializations ? (
                      <div className="flex items-center justify-center h-10 bg-gray-50 rounded-lg border border-gray-200">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Loading specializations...</span>
                      </div>
                    ) : (
                      <Controller
                        name="specializationId"
                        control={control}
                        rules={{ required: 'Specialization is required' }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger 
                              className={cn(
                                "w-full h-10 bg-gray-50 border-gray-200",
                                errors.specializationId && "border-red-500"
                              )}
                            >
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              {specializations.map((spec) => (
                                <SelectItem key={spec.id} value={spec.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-gray-400" />
                                    <span>{spec.name}</span>
                                    {spec._count?.treatments > 0 && (
                                      <span className="text-xs text-gray-400">
                                        ({spec._count.treatments} treatments)
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    {errors.specializationId && (
                      <p className="text-xs text-red-500">{errors.specializationId.message}</p>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                      Experience (years) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="experience"
                        type="number"
                        min="0"
                        max="60"
                        placeholder="5"
                        className={cn(
                          "pl-10 h-10 bg-gray-50 border-gray-200",
                          errors.experience && "border-red-500 focus:ring-red-500"
                        )}
                        {...register('experience', { 
                          required: 'Experience is required',
                          min: {
                            value: 0,
                            message: 'Experience cannot be negative'
                          },
                          max: {
                            value: 60,
                            message: 'Experience seems too high'
                          }
                        })}
                      />
                    </div>
                    {errors.experience && (
                      <p className="text-xs text-red-500">{errors.experience.message}</p>
                    )}
                  </div>

                  {/* Status - Only for editing */}
                  {doctor && (
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status
                      </Label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full h-10 bg-gray-50 border-gray-200">
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
                  )}
                </div>

                {/* Address - Full Width */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea 
                      id="address"
                      placeholder="Enter full address..."
                      rows={3}
                      className="pl-10 bg-gray-50 border-gray-200 resize-none"
                      {...register('address')}
                    />
                  </div>
                </div>
              </div>

              {/* Treatments - Filtered by Specialization */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Assigned Treatments
                  {selectedSpecialization && (
                    <span className="text-xs font-normal text-gray-500">
                      (for {selectedSpecialization.name})
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Select Treatments
                  </Label>
                  
                  {/* Show message if no specialization selected */}
                  {!watchSpecializationId ? (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-sm text-amber-700">
                        Please select a specialization first to see available treatments.
                      </p>
                    </div>
                  ) : fetchingTreatments ? (
                    <div className="flex items-center justify-center h-10 bg-gray-50 rounded-lg border border-gray-200">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Loading treatments...</span>
                    </div>
                  ) : filteredTreatments.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-500">
                        No treatments available for {selectedSpecialization?.name || 'this specialization'}.
                      </p>
                    </div>
                  ) : (
                    <>
                      <SimpleMultiSelect
                        options={treatmentOptions}
                        selected={selectedTreatments}
                        onChange={setSelectedTreatments}
                        placeholder="Select treatments..."
                        searchPlaceholder="Search treatments..."
                        emptyMessage="No treatments found."
                        maxDisplay={3}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {selectedTreatments.length} of {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? 's' : ''} selected
                        </p>
                        {selectedTreatments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedTreatments([])}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Show selected treatments preview */}
                {selectedTreatments.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-2">Selected Treatments:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTreatments.map(id => {
                        const treatment = filteredTreatments.find(t => t.id === id);
                        return treatment ? (
                          <span 
                            key={id} 
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-md text-xs text-blue-700"
                          >
                            {treatment.name}
                            <button
                              type="button"
                              onClick={() => setSelectedTreatments(prev => prev.filter(tId => tId !== id))}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {doctor ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                doctor ? 'Update Doctor' : 'Create Doctor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorForm;