import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic for API routes


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

    const { date } = await req.json();
    const blockDate = new Date(date);
    blockDate.setHours(0, 0, 0, 0);

    const existing = await prisma.availability.findFirst({
      where: { doctorId: doctor.id, isBlocked: true, blockDate: blockDate }
    });

    if (existing) {
      await prisma.availability.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: 'Date unblocked' });
    } else {
      await prisma.availability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: blockDate.getDay(),
          startTime: '00:00',
          endTime: '23:59',
          isBlocked: true,
          blockDate: blockDate
        }
      });
      return NextResponse.json({ message: 'Date blocked' });
    }
  } catch (error) {
    console.error('Toggle Block Date Error:', error);
    return NextResponse.json({ error: 'Failed to toggle block date' }, { status: 500 });
  }
}