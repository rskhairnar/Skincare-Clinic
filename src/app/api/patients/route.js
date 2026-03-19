import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Force dynamic for API routes


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
    const search = searchParams.get('search') || '';

    let where = { deletedAt: null };

    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: 'insensitive' } },
        { patientPhone: { contains: search, mode: 'insensitive' } },
        { patientEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const patientsMap = new Map();

    appointments.forEach(apt => {
      const key = apt.patientPhone;
      if (!patientsMap.has(key)) {
        patientsMap.set(key, {
          name: apt.patientName,
          phone: apt.patientPhone,
          email: apt.patientEmail,
          appointments: []
        });
      }
      patientsMap.get(key).appointments.push(apt);
    });

    const patients = Array.from(patientsMap.values());

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Get Patients Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}