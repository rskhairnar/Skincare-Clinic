import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get single specialization
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const specialization = await prisma.specialization.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
      include: {
        doctors: {
          where: { deletedAt: null },
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        _count: {
          select: { doctors: true },
        },
      },
    });

    if (!specialization) {
      return NextResponse.json(
        { error: 'Specialization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(specialization);
  } catch (error) {
    console.error('Error fetching specialization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialization' },
      { status: 500 }
    );
  }
}

// PUT - Update specialization
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await verifyToken(authHeader);

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, status } = body;

    // Check if specialization exists
    const existing = await prisma.specialization.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Specialization not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.specialization.findFirst({
        where: {
          name: { equals: name.trim(), mode: 'insensitive' },
          deletedAt: null,
          NOT: { id: parseInt(id) },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Specialization with this name already exists' },
          { status: 400 }
        );
      }
    }

    const specialization = await prisma.specialization.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(specialization);
  } catch (error) {
    console.error('Error updating specialization:', error);
    return NextResponse.json(
      { error: 'Failed to update specialization' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete specialization
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await verifyToken(authHeader);

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if specialization exists
    const existing = await prisma.specialization.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
      include: {
        _count: {
          select: { doctors: { where: { deletedAt: null } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Specialization not found' },
        { status: 404 }
      );
    }

    // Check if any doctors are using this specialization
    if (existing._count.doctors > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete specialization. ${existing._count.doctors} doctor(s) are assigned to it.` 
        },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.specialization.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Specialization deleted successfully' });
  } catch (error) {
    console.error('Error deleting specialization:', error);
    return NextResponse.json(
      { error: 'Failed to delete specialization' },
      { status: 500 }
    );
  }
}