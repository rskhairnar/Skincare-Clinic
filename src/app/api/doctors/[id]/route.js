import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
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

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id), deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        treatments: { include: { treatment: true } }
      }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Get Doctor Error:', error);
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
    
    const name = formData.get('name');
    const phone = formData.get('phone');
    const specialization = formData.get('specialization');
    const experience = parseInt(formData.get('experience') || '0');
    const address = formData.get('address');
    const status = formData.get('status');
    const treatmentIds = JSON.parse(formData.get('treatmentIds') || '[]');
    const profileImage = formData.get('profileImage');

    let imagePath;
    if (profileImage && profileImage.size > 0) {
      try {
        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${profileImage.name}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'doctors', filename);
        await writeFile(filepath, buffer);
        imagePath = `/uploads/doctors/${filename}`;
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: {
        specialization,
        experience,
        phone,
        address,
        status,
        ...(imagePath && { profileImage: imagePath }),
        user: { update: { name } },
        treatments: {
          deleteMany: {},
          create: treatmentIds.map(tid => ({ treatmentId: parseInt(tid) }))
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        treatments: { include: { treatment: true } }
      }
    });

    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Update Doctor Error:', error);
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { 
        deletedAt: new Date(),
        user: { update: { deletedAt: new Date() } }
      }
    });

    return NextResponse.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete Doctor Error:', error);
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}