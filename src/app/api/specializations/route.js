import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - List all specializations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const all = searchParams.get("all") === "true";

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
    };

    // If 'all' is true, return all without pagination (for dropdowns)
    if (all) {
      const specializations = await prisma.specialization.findMany({
        where: { ...where, status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      return NextResponse.json({ specializations });
    }

    const [specializations, total] = await Promise.all([
      prisma.specialization.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { doctors: true },
          },
        },
      }),
      prisma.specialization.count({ where }),
    ]);

    return NextResponse.json({
      specializations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return NextResponse.json(
      { error: "Failed to fetch specializations" },
      { status: 500 },
    );
  }
}

// POST - Create specialization
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const user = await verifyToken(authHeader);

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Specialization name is required" },
        { status: 400 },
      );
    }

    // Check if specialization already exists
    const existing = await prisma.specialization.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Specialization with this name already exists" },
        { status: 400 },
      );
    }

    const specialization = await prisma.specialization.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(specialization, { status: 201 });
  } catch (error) {
    console.error("Error creating specialization:", error);
    return NextResponse.json(
      { error: "Failed to create specialization" },
      { status: 500 },
    );
  }
}
