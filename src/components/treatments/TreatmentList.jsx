'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import TreatmentForm from './TreatmentForm';
import { toast } from '@/components/ui/use-toast';

const TreatmentList = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { token } = useAuthStore();

  useEffect(() => {
    fetchTreatments();
  }, [search, statusFilter]);

  const fetchTreatments = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTreatments(response.data.treatments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch treatments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this treatment?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: 'Treatment deleted successfully'
      });
      fetchTreatments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete treatment',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (treatment) => {
    setSelectedTreatment(treatment);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTreatment(null);
    fetchTreatments();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treatments</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Treatment
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search treatments..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Doctors</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treatments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No treatments found
                </TableCell>
              </TableRow>
            ) : (
              treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {treatment.description}
                  </TableCell>
                  <TableCell>{formatDuration(treatment.duration)}</TableCell>
                  <TableCell>{formatPrice(treatment.price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {treatment._count?.doctors || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {treatment._count?.appointments || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={treatment.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={treatment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {treatment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(treatment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(treatment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <TreatmentForm 
          treatment={selectedTreatment}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default TreatmentList;