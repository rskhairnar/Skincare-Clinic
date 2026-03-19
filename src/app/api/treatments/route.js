import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && status !== 'all' && { status })
    };

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        include: {
          _count: { select: { doctors: true, appointments: true } }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.treatment.count({ where })
    ]);

    return NextResponse.json({
      treatments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get Treatments Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, duration, price, status } = await req.json();

    const treatment = await prisma.treatment.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        status: status || 'ACTIVE'
      }
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    console.error('Create Treatment Error:', error);
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 });
  }
}