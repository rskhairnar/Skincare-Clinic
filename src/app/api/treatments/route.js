import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    const specializationId = searchParams.get('specializationId');
    const all = searchParams.get('all') === 'true';

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { specialization: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(status && status !== 'all' && { status }),
      ...(specializationId && { specializationId: parseInt(specializationId) })
    };

    // Return all treatments without pagination (for dropdowns)
    if (all) {
      const treatments = await prisma.treatment.findMany({
        where: { ...where, status: 'ACTIVE' },
        include: {
          specialization: true
        },
        orderBy: [
          { specialization: { name: 'asc' } },
          { name: 'asc' }
        ]
      });

      return NextResponse.json({ treatments });
    }

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        include: {
          specialization: true,
          _count: {
            select: { 
              doctors: true,
              appointments: true 
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.treatment.count({ where })
    ]);

    return NextResponse.json({
      treatments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Treatments Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message }, 
      { status: 500 }
    );
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

    const body = await req.json();
    const { name, description, duration, price, specializationId, status } = body;

    // Validate required fields
    if (!name || !description || !duration || !price || !specializationId) {
      return NextResponse.json(
        { error: 'Name, description, duration, price, and specialization are required' },
        { status: 400 }
      );
    }

    // Validate specialization exists
    const specialization = await prisma.specialization.findFirst({
      where: { 
        id: parseInt(specializationId), 
        deletedAt: null,
        status: 'ACTIVE'
      }
    });

    if (!specialization) {
      return NextResponse.json(
        { error: 'Invalid specialization selected' },
        { status: 400 }
      );
    }

    const treatment = await prisma.treatment.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        specializationId: parseInt(specializationId),
        status: status || 'ACTIVE'
      },
      include: {
        specialization: true
      }
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    console.error('Create Treatment Error:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment', message: error.message }, 
      { status: 500 }
    );
  }
}