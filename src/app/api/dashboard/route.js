import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Force dynamic for API routes
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const userRole = decoded.role;
    const userId = decoded.id;

    if (userRole === "SUPER_ADMIN") {
      const [
        totalDoctors,
        totalAppointments,
        recentAppointments,
        appointmentsByStatus,
      ] = await Promise.all([
        prisma.doctor.count({ where: { deletedAt: null } }),
        prisma.appointment.count({ where: { deletedAt: null } }),
        prisma.appointment.findMany({
          where: { deletedAt: null },
          include: {
            doctor: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            treatment: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
        prisma.appointment.groupBy({
          by: ["status"],
          where: { deletedAt: null },
          _count: true,
        }),
      ]);

      const uniquePatients = await prisma.appointment.findMany({
        where: { deletedAt: null },
        select: { patientPhone: true },
        distinct: ["patientPhone"],
      });
      const totalPatients = uniquePatients.length;

      const completedAppointments = await prisma.appointment.findMany({
        where: { deletedAt: null, status: "COMPLETED" },
        include: { treatment: true },
      });

      const totalRevenue = completedAppointments.reduce(
        (sum, apt) => sum + parseFloat(apt.treatment.price || 0),
        0,
      );

      return NextResponse.json({
        stats: {
          totalDoctors,
          totalPatients,
          totalAppointments,
          totalRevenue: totalRevenue.toFixed(2),
        },
        recentAppointments,
        appointmentsByStatus,
      });
    } else {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: userId },
      });

      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor profile not found" },
          { status: 404 },
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayAppointments, upcomingAppointments, appointmentsByStatus] =
        await Promise.all([
          prisma.appointment.findMany({
            where: {
              doctorId: doctor.id,
              deletedAt: null,
              dateTime: { gte: today, lt: tomorrow },
            },
            include: { treatment: true },
            orderBy: { dateTime: "asc" },
          }),
          prisma.appointment.findMany({
            where: {
              doctorId: doctor.id,
              deletedAt: null,
              dateTime: { gte: new Date() },
              status: { in: ["PENDING", "CONFIRMED"] },
            },
            include: { treatment: true },
            take: 10,
            orderBy: { dateTime: "asc" },
          }),
          prisma.appointment.groupBy({
            by: ["status"],
            where: { doctorId: doctor.id, deletedAt: null },
            _count: true,
          }),
        ]);

      const uniquePatients = await prisma.appointment.findMany({
        where: { doctorId: doctor.id, deletedAt: null },
        select: { patientPhone: true },
        distinct: ["patientPhone"],
      });
      const totalPatients = uniquePatients.length;

      return NextResponse.json({
        stats: {
          todayAppointments: todayAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
          totalPatients,
        },
        todayAppointments,
        upcomingAppointments,
        appointmentsByStatus,
      });
    }
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
