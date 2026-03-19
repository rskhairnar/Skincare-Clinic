'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { Clock, Plus, Trash2 } from 'lucide-react';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const AvailabilityManager = () => {
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuthStore();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/availability`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAvailability(response.data.availability || []);
      setBlockedDates(response.data.blockedDates || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek) => {
    setAvailability([
      ...availability,
      { dayOfWeek, startTime: '09:00', endTime: '17:00', isNew: true }
    ]);
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const removeTimeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/availability`,
        { availability },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: 'Availability saved successfully'
      });
      fetchAvailability();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save availability',
        variant: 'destructive'
      });
    }
  };

  const toggleBlockDate = async (date) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/availability/block`,
        { date: date.toISOString() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchAvailability();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update blocked dates',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Availability</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {DAYS.map((day) => {
                const daySlots = availability.filter(a => a.dayOfWeek === day.value);
                
                return (
                  <div key={day.value} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{day.label}</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addTimeSlot(day.value)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Slot
                      </Button>
                    </div>
                    
                    {daySlots.length === 0 ? (
                      <p className="text-sm text-gray-500">No slots configured</p>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map((slot, idx) => {
                          const originalIndex = availability.findIndex(
                            a => a === slot
                          );
                          
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(originalIndex, 'startTime', e.target.value)}
                                  className="w-32"
                                />
                                <span>to</span>
                                <Input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => updateTimeSlot(originalIndex, 'endTime', e.target.value)}
                                  className="w-32"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTimeSlot(originalIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <Button onClick={saveAvailability} className="mt-6 w-full">
              Save Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Block Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Block Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Click on dates to block/unblock them
            </p>
            <Calendar
              mode="multiple"
              selected={blockedDates.map(d => new Date(d))}
              onSelect={(dates) => {
                if (dates && dates.length > 0) {
                  const lastDate = dates[dates.length - 1];
                  toggleBlockDate(lastDate);
                }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityManager;