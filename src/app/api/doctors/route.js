import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hashPassword } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

// Force dynamic for API routes
export const dynamic = 'force-dynamic';

function getAuthUser(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { specialization: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && status !== 'all' && { status })
    };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          treatments: {
            include: { treatment: true }
          },
          _count: {
            select: { appointments: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.doctor.count({ where })
    ]);

    return NextResponse.json({
      doctors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Doctors Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const phone = formData.get('phone');
    const specialization = formData.get('specialization');
    const experience = parseInt(formData.get('experience') || '0');
    const address = formData.get('address') || '';
    const treatmentIds = JSON.parse(formData.get('treatmentIds') || '[]');
    const profileImage = formData.get('profileImage');

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    let imagePath = null;
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

    const hashedPassword = await hashPassword(password);

    const doctor = await prisma.doctor.create({
      data: {
        specialization,
        experience,
        phone,
        address,
        profileImage: imagePath,
        status: 'ACTIVE',
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'DOCTOR_ADMIN'
          }
        },
        treatments: {
          create: treatmentIds.map(id => ({ treatmentId: parseInt(id) }))
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        treatments: { include: { treatment: true } }
      }
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error('Create Doctor Error:', error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}