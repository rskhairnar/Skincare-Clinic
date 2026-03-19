import BlogList from '@/components/blogs/BlogList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BlogsPage() {
  return <BlogList />;
}