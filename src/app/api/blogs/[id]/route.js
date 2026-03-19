import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateSlug } from '@/utils/slug';
import { writeFile } from 'fs/promises';
import path from 'path';

// Force dynamic for API routes


function getAuthUser(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id), deletedAt: null },
      include: { author: { select: { id: true, name: true, email: true } } }
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Get Blog Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await req.formData();
    
    const title = formData.get('title');
    const content = formData.get('content');
    const status = formData.get('status');
    const image = formData.get('image');

    let imagePath;
    if (image && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${image.name}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'blogs', filename);
        await writeFile(filepath, buffer);
        imagePath = `/uploads/blogs/${filename}`;
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
      }
    }

    const slug = generateSlug(title);

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        content,
        status,
        ...(imagePath && { image: imagePath })
      },
      include: { author: { select: { id: true, name: true, email: true } } }
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Update Blog Error:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.blog.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}