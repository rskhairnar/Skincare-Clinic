import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic for API routes


export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let doctorId;

    if (decoded.role === 'DOCTOR_ADMIN') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: decoded.id } });
      doctorId = doctor?.id;
    } else {
      const { searchParams } = new URL(req.url);
      doctorId = parseInt(searchParams.get('doctorId'));
    }

    if (!doctorId) {
      return NextResponse.json({ availability: [], blockedDates: [] });
    }

    const availability = await prisma.availability.findMany({
      where: { doctorId, isBlocked: false },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });

    const blockedDates = await prisma.availability.findMany({
      where: { doctorId, isBlocked: true, blockDate: { not: null } },
      select: { blockDate: true }
    });

    return NextResponse.json({
      availability,
      blockedDates: blockedDates.map(b => b.blockDate)
    });
  } catch (error) {
    console.error('Get Availability Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'DOCTOR_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: decoded.id } });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const { availability } = await req.json();

    await prisma.availability.deleteMany({
      where: { doctorId: doctor.id, isBlocked: false }
    });

    if (availability && availability.length > 0) {
      await prisma.availability.createMany({
        data: availability.map(slot => ({
          doctorId: doctor.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBlocked: false
        }))
      });
    }

    return NextResponse.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update Availability Error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}