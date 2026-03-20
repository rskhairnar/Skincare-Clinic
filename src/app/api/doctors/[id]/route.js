import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hashPassword } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

function getAuthUser(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'doctors');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {}
  return uploadDir;
}

async function deleteOldImage(imagePath) {
  if (!imagePath) return;
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    await unlink(fullPath);
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
}

// GET single doctor
export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const doctor = await prisma.doctor.findFirst({
      where: { 
        id: parseInt(id),
        deletedAt: null 
      },
      include: {
        user: { 
          select: { id: true, name: true, email: true, role: true } 
        },
        specialization: true,
        treatments: { 
          include: { 
            treatment: {
              include: {
                specialization: true
              }
            } 
          } 
        },
        availability: true,
        _count: {
          select: { 
            appointments: { where: { deletedAt: null } }
          }
        }
      }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Get Doctor Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message }, 
      { status: 500 }
    );
  }
}

// UPDATE doctor
export async function PUT(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const doctorId = parseInt(id);

    const existingDoctor = await prisma.doctor.findFirst({
      where: { id: doctorId, deletedAt: null },
      include: { user: true }
    });

    if (!existingDoctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Only SUPER_ADMIN or the doctor themselves can update
    if (user.role !== 'SUPER_ADMIN' && existingDoctor.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const specializationId = formData.get('specializationId') 
      ? parseInt(formData.get('specializationId')) 
      : undefined;
    const experience = formData.get('experience') 
      ? parseInt(formData.get('experience')) 
      : undefined;
    const address = formData.get('address');
    const status = formData.get('status');
    const treatmentIds = formData.get('treatmentIds') 
      ? JSON.parse(formData.get('treatmentIds')) 
      : undefined;
    const profileImage = formData.get('profileImage');
    const password = formData.get('password');

    // Check email uniqueness if changing
    if (email && email !== existingDoctor.user.email) {
      const emailExists = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: existingDoctor.userId }
        }
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Validate specialization if provided
    if (specializationId) {
      const specialization = await prisma.specialization.findFirst({
        where: { 
          id: specializationId, 
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

    // Handle image upload
    let imagePath = undefined;
    if (profileImage && profileImage.size > 0) {
      try {
        if (existingDoctor.profileImage) {
          await deleteOldImage(existingDoctor.profileImage);
        }

        const uploadDir = await ensureUploadDir();
        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const ext = path.extname(profileImage.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const filepath = path.join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        imagePath = `/uploads/doctors/${filename}`;
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
      }
    }

    // Prepare user update data
    const userUpdateData = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email;
    if (password) userUpdateData.password = await hashPassword(password);

    // Prepare doctor update data - USE connect FOR RELATION
    const doctorUpdateData = {};
    if (specializationId !== undefined) {
      doctorUpdateData.specialization = {
        connect: { id: specializationId }
      };
    }
    if (experience !== undefined) doctorUpdateData.experience = experience;
    if (phone) doctorUpdateData.phone = phone;
    if (address !== undefined) doctorUpdateData.address = address;
    if (status) doctorUpdateData.status = status;
    if (imagePath) doctorUpdateData.profileImage = imagePath;

    // Update in transaction
    const updatedDoctor = await prisma.$transaction(async (tx) => {
      // Update user if needed
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingDoctor.userId },
          data: userUpdateData
        });
      }

      // Update treatments if provided
      if (treatmentIds !== undefined) {
        // Remove existing treatments
        await tx.doctorTreatment.deleteMany({
          where: { doctorId }
        });

        // Add new treatments
        if (treatmentIds.length > 0) {
          await tx.doctorTreatment.createMany({
            data: treatmentIds.map(tId => ({
              doctorId,
              treatmentId: parseInt(tId)
            }))
          });
        }
      }

      // Update doctor
      return tx.doctor.update({
        where: { id: doctorId },
        data: doctorUpdateData,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          specialization: true,
          treatments: { 
            include: { 
              treatment: {
                include: {
                  specialization: true
                }
              } 
            } 
          }
        }
      });
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error('Update Doctor Error:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor', message: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE doctor (soft delete)
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
    const doctorId = parseInt(id);

    const existingDoctor = await prisma.doctor.findFirst({
      where: { id: doctorId, deletedAt: null }
    });

    if (!existingDoctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Check for future appointments
    const futureAppointments = await prisma.appointment.count({
      where: {
        doctorId,
        dateTime: { gte: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] },
        deletedAt: null
      }
    });

    if (futureAppointments > 0) {
      return NextResponse.json(
        { error: `Cannot delete doctor with ${futureAppointments} upcoming appointment(s)` },
        { status: 400 }
      );
    }

    // Soft delete doctor and user
    await prisma.$transaction([
      prisma.doctor.update({
        where: { id: doctorId },
        data: { deletedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: existingDoctor.userId },
        data: { deletedAt: new Date() }
      })
    ]);

    return NextResponse.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete Doctor Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor', message: error.message }, 
      { status: 500 }
    );
  }
}