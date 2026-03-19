const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Super Admin
  const adminPassword = await bcrypt.hash('password123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@clinic.com',
      password: adminPassword,
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Created Super Admin:', superAdmin.email);

  // Create Treatments
  const treatments = await Promise.all([
    prisma.treatment.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Basic Facial',
        description: 'A refreshing facial treatment that cleanses and rejuvenates your skin.',
        duration: 30,
        price: 75.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Deep Cleansing Facial',
        description: 'Deep pore cleansing facial with extraction and mask treatment.',
        duration: 60,
        price: 120.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Anti-Aging Treatment',
        description: 'Advanced anti-aging facial with collagen boost and firming serum.',
        duration: 75,
        price: 180.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Acne Treatment',
        description: 'Specialized treatment for acne-prone skin with salicylic acid.',
        duration: 45,
        price: 95.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Chemical Peel',
        description: 'Professional chemical peel for skin resurfacing and renewal.',
        duration: 45,
        price: 150.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: 'Microdermabrasion',
        description: 'Exfoliating treatment that removes dead skin cells for smoother skin.',
        duration: 60,
        price: 135.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 7 },
      update: {},
      create: {
        name: 'LED Light Therapy',
        description: 'Light therapy treatment for skin healing and collagen production.',
        duration: 30,
        price: 85.00,
        status: 'ACTIVE'
      }
    }),
    prisma.treatment.upsert({
      where: { id: 8 },
      update: {},
      create: {
        name: 'Hydrating Facial',
        description: 'Intensive hydration treatment for dry and dehydrated skin.',
        duration: 45,
        price: 110.00,
        status: 'ACTIVE'
      }
    })
  ]);
  console.log('Created Treatments:', treatments.length);

  // Create Doctors
  const doctorPassword = await bcrypt.hash('password123', 10);
  
  const doctor1User = await prisma.user.upsert({
    where: { email: 'doctor@clinic.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Johnson',
      email: 'doctor@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctor1User.id },
    update: {},
    create: {
      userId: doctor1User.id,
      specialization: 'Dermatology',
      experience: 10,
      phone: '+1-555-0101',
      address: '123 Medical Center, Suite 100',
      status: 'ACTIVE'
    }
  });

  const doctor2User = await prisma.user.upsert({
    where: { email: 'emily@clinic.com' },
    update: {},
    create: {
      name: 'Dr. Emily Chen',
      email: 'emily@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctor2User.id },
    update: {},
    create: {
      userId: doctor2User.id,
      specialization: 'Cosmetic Dermatology',
      experience: 8,
      phone: '+1-555-0102',
      address: '123 Medical Center, Suite 102',
      status: 'ACTIVE'
    }
  });

  const doctor3User = await prisma.user.upsert({
    where: { email: 'michael@clinic.com' },
    update: {},
    create: {
      name: 'Dr. Michael Brown',
      email: 'michael@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor3 = await prisma.doctor.upsert({
    where: { userId: doctor3User.id },
    update: {},
    create: {
      userId: doctor3User.id,
      specialization: 'Aesthetic Medicine',
      experience: 12,
      phone: '+1-555-0103',
      address: '123 Medical Center, Suite 103',
      status: 'ACTIVE'
    }
  });

  console.log('Created Doctors:', 3);

  // Assign Treatments to Doctors
  await prisma.doctorTreatment.createMany({
    data: [
      { doctorId: doctor1.id, treatmentId: 1 },
      { doctorId: doctor1.id, treatmentId: 2 },
      { doctorId: doctor1.id, treatmentId: 4 },
      { doctorId: doctor1.id, treatmentId: 5 },
      { doctorId: doctor2.id, treatmentId: 1 },
      { doctorId: doctor2.id, treatmentId: 3 },
      { doctorId: doctor2.id, treatmentId: 6 },
      { doctorId: doctor2.id, treatmentId: 7 },
      { doctorId: doctor3.id, treatmentId: 2 },
      { doctorId: doctor3.id, treatmentId: 3 },
      { doctorId: doctor3.id, treatmentId: 5 },
      { doctorId: doctor3.id, treatmentId: 8 }
    ],
    skipDuplicates: true
  });
  console.log('Assigned Treatments to Doctors');

  // Create Availability
  const availabilityData = [];
  [doctor1.id, doctor2.id, doctor3.id].forEach(doctorId => {
    // Monday to Friday, 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      availabilityData.push({
        doctorId,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isBlocked: false
      });
    }
  });

  await prisma.availability.createMany({
    data: availabilityData,
    skipDuplicates: true
  });
  console.log('Created Availability');

  // Create Sample Appointments
  const today = new Date();
  const appointments = [
    {
      patientName: 'John Smith',
      patientPhone: '+1-555-1001',
      patientEmail: 'john@example.com',
      doctorId: doctor1.id,
      treatmentId: 1,
      dateTime: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'CONFIRMED',
      notes: 'First visit, sensitive skin'
    },
    {
      patientName: 'Jane Doe',
      patientPhone: '+1-555-1002',
      patientEmail: 'jane@example.com',
      doctorId: doctor1.id,
      treatmentId: 2,
      dateTime: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      status: 'PENDING',
      notes: null
    },
    {
      patientName: 'Alice Johnson',
      patientPhone: '+1-555-1003',
      patientEmail: 'alice@example.com',
      doctorId: doctor2.id,
      treatmentId: 3,
      dateTime: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'CONFIRMED',
      notes: 'Anti-aging consultation'
    },
    {
      patientName: 'Bob Williams',
      patientPhone: '+1-555-1004',
      patientEmail: 'bob@example.com',
      doctorId: doctor2.id,
      treatmentId: 7,
      dateTime: new Date(today.getTime() + 48 * 60 * 60 * 1000), // 2 days from now
      status: 'PENDING',
      notes: null
    },
    {
      patientName: 'Carol Davis',
      patientPhone: '+1-555-1005',
      patientEmail: 'carol@example.com',
      doctorId: doctor3.id,
      treatmentId: 5,
      dateTime: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      status: 'COMPLETED',
      notes: 'Chemical peel completed successfully'
    },
    {
      patientName: 'David Miller',
      patientPhone: '+1-555-1006',
      patientEmail: 'david@example.com',
      doctorId: doctor3.id,
      treatmentId: 8,
      dateTime: new Date(today.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      status: 'COMPLETED',
      notes: null
    },
    {
      patientName: 'Emma Wilson',
      patientPhone: '+1-555-1007',
      patientEmail: 'emma@example.com',
      doctorId: doctor1.id,
      treatmentId: 4,
      dateTime: new Date(today.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
      status: 'CANCELLED',
      notes: 'Patient cancelled due to illness'
    }
  ];

  await prisma.appointment.createMany({
    data: appointments,
    skipDuplicates: true
  });
  console.log('Created Appointments:', appointments.length);

  // Create Sample Blogs
  const blogs = [
    {
      title: '10 Tips for Healthy Glowing Skin',
      slug: '10-tips-for-healthy-glowing-skin',
      content: `
        <h2>Introduction</h2>
        <p>Achieving healthy, glowing skin doesn't have to be complicated. Here are our top 10 tips for maintaining beautiful skin.</p>
        
        <h3>1. Stay Hydrated</h3>
        <p>Drink at least 8 glasses of water daily to keep your skin hydrated from the inside out.</p>
        
        <h3>2. Cleanse Twice Daily</h3>
        <p>Cleanse your face in the morning and evening to remove dirt, oil, and makeup.</p>
        
        <h3>3. Use Sunscreen</h3>
        <p>Apply SPF 30 or higher sunscreen every day, even on cloudy days.</p>
        
        <h3>4. Moisturize Regularly</h3>
        <p>Use a moisturizer suitable for your skin type to maintain skin barrier.</p>
        
        <h3>5. Get Enough Sleep</h3>
        <p>Aim for 7-9 hours of quality sleep for skin repair and regeneration.</p>
      `,
      authorId: superAdmin.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Understanding Different Skin Types',
      slug: 'understanding-different-skin-types',
      content: `
        <h2>Know Your Skin Type</h2>
        <p>Understanding your skin type is the first step to proper skincare.</p>
        
        <h3>Normal Skin</h3>
        <p>Well-balanced skin that is neither too oily nor too dry.</p>
        
        <h3>Oily Skin</h3>
        <p>Produces excess sebum, often appears shiny with enlarged pores.</p>
        
        <h3>Dry Skin</h3>
        <p>Lacks moisture, may feel tight and show flakes or rough patches.</p>
        
        <h3>Combination Skin</h3>
        <p>Mix of oily and dry areas, typically oily T-zone with dry cheeks.</p>
        
        <h3>Sensitive Skin</h3>
        <p>Reacts easily to products, prone to redness and irritation.</p>
      `,
      authorId: superAdmin.id,
      status: 'PUBLISHED'
    },
    {
      title: 'The Benefits of Regular Facials',
      slug: 'benefits-of-regular-facials',
      content: `
        <h2>Why You Should Get Regular Facials</h2>
        <p>Professional facials offer numerous benefits for your skin health.</p>
        
        <h3>Deep Cleansing</h3>
        <p>Professional extraction removes blackheads and unclogs pores.</p>
        
        <h3>Anti-Aging Benefits</h3>
        <p>Stimulates collagen production and reduces fine lines.</p>
        
        <h3>Stress Relief</h3>
        <p>Relaxing facial massage reduces stress and promotes well-being.</p>
        
        <h3>Expert Advice</h3>
        <p>Get personalized skincare recommendations from professionals.</p>
      `,
      authorId: doctor1User.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Winter Skincare Tips',
      slug: 'winter-skincare-tips',
      content: `
        <h2>Protect Your Skin This Winter</h2>
        <p>Cold weather can be harsh on your skin. Here's how to protect it.</p>
        
        <h3>Switch to Heavier Moisturizer</h3>
        <p>Use cream-based moisturizers instead of lotions.</p>
        
        <h3>Don't Skip Sunscreen</h3>
        <p>UV rays are still present in winter and can reflect off snow.</p>
        
        <h3>Use a Humidifier</h3>
        <p>Combat dry indoor air with a humidifier.</p>
      `,
      authorId: doctor2User.id,
      status: 'DRAFT'
    }
  ];

  await prisma.blog.createMany({
    data: blogs,
    skipDuplicates: true
  });
  console.log('Created Blogs:', blogs.length);

  // Create Settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clinicName: 'Skincare Clinic',
      email: 'info@skincareclinic.com',
      phone: '+1-555-0100',
      address: '123 Medical Center, Healthcare City, HC 12345',
      timezone: 'America/New_York',
      slotDuration: 30,
      bookingBuffer: 60
    }
  });
  console.log('Created Settings');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });