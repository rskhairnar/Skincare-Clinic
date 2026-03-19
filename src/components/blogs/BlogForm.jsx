
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

const BlogForm = ({ blog, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(blog?.image || null);
  const { token, user } = useAuthStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      status: 'DRAFT'
    }
  });

  useEffect(() => {
    if (blog) {
      setValue('title', blog.title);
      setValue('content', blog.content);
      setValue('status', blog.status);
    }
  }, [blog, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('status', data.status);
      formData.append('authorId', user.id);

      if (data.image?.[0]) {
        formData.append('image', data.image[0]);
      }

      if (blog) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog.id}`,
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
          description: 'Blog updated successfully'
        });
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs`,
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
          description: 'Blog created successfully'
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save blog',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {blog ? 'Edit Blog' : 'New Blog'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title"
              placeholder="Enter blog title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <span className="text-red-500 text-sm">{errors.title.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea 
              id="content"
              placeholder="Write your blog content..."
              rows={10}
              {...register('content', { required: 'Content is required' })}
            />
            {errors.content && (
              <span className="text-red-500 text-sm">{errors.content.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="image">Featured Image</Label>
            <Input 
              id="image"
              type="file"
              accept="image/*"
              {...register('image')}
              onChange={handleImageChange}
            />
            {preview && (
              <div className="mt-2">
                <img 
                  src={preview} 
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              onValueChange={(value) => setValue('status', value)}
              defaultValue={blog?.status || 'DRAFT'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : blog ? 'Update Blog' : 'Publish Blog'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogForm;