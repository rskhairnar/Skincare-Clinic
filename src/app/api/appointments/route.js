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
    const doctorId = searchParams.get('doctorId');
    const treatmentId = searchParams.get('treatmentId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let where = { deletedAt: null };

    if (user.role === 'DOCTOR_ADMIN') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
      if (doctor) where.doctorId = doctor.id;
    } else if (doctorId && doctorId !== 'all') {
      where.doctorId = parseInt(doctorId);
    }

    if (treatmentId && treatmentId !== 'all') where.treatmentId = parseInt(treatmentId);
    if (status && status !== 'all') where.status = status;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.dateTime = { gte: startDate, lte: endDate };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
          treatment: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateTime: 'desc' }
      }),
      prisma.appointment.count({ where })
    ]);

    return NextResponse.json({
      appointments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get Appointments Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientName, patientPhone, patientEmail, doctorId, treatmentId, dateTime, notes } = await req.json();

    if (!patientName || !patientPhone || !doctorId || !treatmentId || !dateTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        patientPhone,
        patientEmail: patientEmail || null,
        doctorId: parseInt(doctorId),
        treatmentId: parseInt(treatmentId),
        dateTime: new Date(dateTime),
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
        treatment: true
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}