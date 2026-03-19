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

export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id), deletedAt: null },
      include: {
        doctors: {
          include: {
            doctor: { include: { user: { select: { id: true, name: true, email: true } } } }
          }
        }
      }
    });

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Get Treatment Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { name, description, duration, price, status } = await req.json();

    const treatment = await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        status
      }
    });

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Update Treatment Error:', error);
    return NextResponse.json({ error: 'Failed to update treatment' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Delete Treatment Error:', error);
    return NextResponse.json({ error: 'Failed to delete treatment' }, { status: 500 });
  }
}