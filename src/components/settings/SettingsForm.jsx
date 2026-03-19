
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Building2, Mail, Phone, MapPin, Clock, Settings } from 'lucide-react';

const timezones = [
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Denver', label: 'America/Denver' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'UTC', label: 'UTC' }
];

const SettingsForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTimezone, setCurrentTimezone] = useState('UTC');
  const { token } = useAuthStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/settings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const settings = response.data;
      Object.keys(settings).forEach(key => {
        setValue(key, settings[key]);
      });
      if (settings.timezone) {
        setCurrentTimezone(settings.timezone);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimezoneChange = (value) => {
    setCurrentTimezone(value);
    setValue('timezone', value);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/settings`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: 'Settings saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input 
                  id="clinicName"
                  {...register('clinicName', { required: true })}
                />
              </div>

              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input 
                  id="logo"
                  {...register('logo')}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  {...register('email', { required: true })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  {...register('phone', { required: true })}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address"
                  rows={3}
                  {...register('address')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Appointment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={currentTimezone}
                  onValueChange={handleTimezoneChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                <Input 
                  id="slotDuration"
                  type="number"
                  min="15"
                  step="15"
                  {...register('slotDuration')}
                />
              </div>

              <div>
                <Label htmlFor="bookingBuffer">Booking Buffer (minutes)</Label>
                <Input 
                  id="bookingBuffer"
                  type="number"
                  min="0"
                  step="15"
                  {...register('bookingBuffer')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum time before appointment can be booked
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;