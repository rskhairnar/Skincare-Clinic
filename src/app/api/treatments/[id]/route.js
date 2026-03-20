import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthUser(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

// GET single treatment
export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const treatment = await prisma.treatment.findFirst({
      where: { 
        id: parseInt(id),
        deletedAt: null 
      },
      include: {
        specialization: true,
        doctors: {
          include: {
            doctor: {
              include: {
                user: { select: { name: true } },
                specialization: true
              }
            }
          }
        },
        _count: {
          select: { appointments: true }
        }
      }
    });

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Get Treatment Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message }, 
      { status: 500 }
    );
  }
}

// UPDATE treatment
export async function PUT(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const treatmentId = parseInt(id);

    const existingTreatment = await prisma.treatment.findFirst({
      where: { id: treatmentId, deletedAt: null }
    });

    if (!existingTreatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, duration, price, specializationId, status } = body;

    // Validate specialization if provided
    if (specializationId) {
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
    }

    const treatment = await prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(duration && { duration: parseInt(duration) }),
        ...(price && { price: parseFloat(price) }),
        ...(specializationId && { specializationId: parseInt(specializationId) }),
        ...(status && { status })
      },
      include: {
        specialization: true
      }
    });

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Update Treatment Error:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment', message: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE treatment (soft delete)
export async function DELETE(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const treatmentId = parseInt(id);

    const existingTreatment = await prisma.treatment.findFirst({
      where: { id: treatmentId, deletedAt: null }
    });

    if (!existingTreatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    // Check for future appointments
    const futureAppointments = await prisma.appointment.count({
      where: {
        treatmentId,
        dateTime: { gte: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] },
        deletedAt: null
      }
    });

    if (futureAppointments > 0) {
      return NextResponse.json(
        { error: `Cannot delete treatment with ${futureAppointments} upcoming appointment(s)` },
        { status: 400 }
      );
    }

    await prisma.treatment.update({
      where: { id: treatmentId },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Delete Treatment Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment', message: error.message }, 
      { status: 500 }
    );
  }
}