export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
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
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';
import BlogForm from './BlogForm';
import { toast } from '@/components/ui/use-toast';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { token } = useAuthStore();

  useEffect(() => {
    fetchBlogs();
  }, [search, statusFilter]);

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBlogs(response.data.blogs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch blogs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Success',
        description: 'Blog deleted successfully'
      });
      fetchBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedBlog(null);
    fetchBlogs();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Blog
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search blogs..." 
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
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No blogs found
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    {blog.image ? (
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{blog.title}</div>
                      <div className="text-sm text-gray-500">{blog.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>{blog.author.name}</TableCell>
                  <TableCell>
                    <Badge 
                      className={blog.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleDelete(blog.id)}
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
        <BlogForm 
          blog={selectedBlog}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default BlogList;