// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data in correct order (respecting foreign keys)
  console.log('Clearing existing data...');
  await prisma.appointment.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.doctorTreatment.deleteMany({});
  await prisma.treatment.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.specialization.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.settings.deleteMany({});

  // =====================
  // Create Super Admin
  // =====================
  const adminPassword = await bcrypt.hash('password123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@clinic.com',
      password: adminPassword,
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Created Super Admin:', superAdmin.email);

  // =====================
  // Create Specializations with their Treatments
  // =====================

  // 1. General Skincare
  const specGeneral = await prisma.specialization.create({
    data: {
      name: 'General Skincare',
      description: 'Basic skincare services and facial treatments for all skin types.',
      icon: 'Sparkles',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Basic Facial',
            description: 'A refreshing facial treatment that cleanses and rejuvenates your skin. Includes cleansing, toning, and moisturizing.',
            duration: 30,
            price: 75.00,
            status: 'ACTIVE'
          },
          {
            name: 'Deep Cleansing Facial',
            description: 'Deep pore cleansing facial with extraction and mask treatment. Perfect for congested skin.',
            duration: 60,
            price: 120.00,
            status: 'ACTIVE'
          },
          {
            name: 'Hydrating Facial',
            description: 'Intensive hydration treatment for dry and dehydrated skin using hyaluronic acid serums.',
            duration: 45,
            price: 110.00,
            status: 'ACTIVE'
          },
          {
            name: 'Express Facial',
            description: 'Quick 20-minute facial for busy schedules. Includes cleanse, mask, and moisturize.',
            duration: 20,
            price: 50.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 2. Anti-Aging
  const specAntiAging = await prisma.specialization.create({
    data: {
      name: 'Anti-Aging',
      description: 'Advanced treatments targeting fine lines, wrinkles, and skin aging.',
      icon: 'Clock',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Anti-Aging Facial',
            description: 'Advanced anti-aging facial with collagen boost and firming serum. Reduces fine lines and wrinkles.',
            duration: 75,
            price: 180.00,
            status: 'ACTIVE'
          },
          {
            name: 'Collagen Induction Therapy',
            description: 'Microneedling treatment to stimulate natural collagen production for firmer, younger-looking skin.',
            duration: 60,
            price: 250.00,
            status: 'ACTIVE'
          },
          {
            name: 'Botox Treatment',
            description: 'Injectable treatment to reduce dynamic wrinkles and fine lines. Results last 3-6 months.',
            duration: 30,
            price: 350.00,
            status: 'ACTIVE'
          },
          {
            name: 'Dermal Fillers',
            description: 'Hyaluronic acid fillers to restore volume and smooth deep wrinkles.',
            duration: 45,
            price: 400.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 3. Acne Treatment
  const specAcne = await prisma.specialization.create({
    data: {
      name: 'Acne Treatment',
      description: 'Specialized treatments for acne-prone skin and acne scarring.',
      icon: 'Shield',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Acne Facial',
            description: 'Specialized treatment for acne-prone skin with salicylic acid and gentle extractions.',
            duration: 45,
            price: 95.00,
            status: 'ACTIVE'
          },
          {
            name: 'Acne Scar Treatment',
            description: 'Targeted treatment to reduce the appearance of acne scars using advanced techniques.',
            duration: 60,
            price: 175.00,
            status: 'ACTIVE'
          },
          {
            name: 'Blue Light Therapy for Acne',
            description: 'LED blue light therapy to kill acne-causing bacteria and reduce breakouts.',
            duration: 30,
            price: 85.00,
            status: 'ACTIVE'
          },
          {
            name: 'Acne Peel',
            description: 'Chemical peel specifically formulated for acne-prone skin with salicylic and glycolic acid.',
            duration: 45,
            price: 130.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 4. Laser Treatments
  const specLaser = await prisma.specialization.create({
    data: {
      name: 'Laser Treatments',
      description: 'Advanced laser-based procedures for various skin concerns.',
      icon: 'Zap',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Laser Hair Removal',
            description: 'Permanent hair reduction using advanced laser technology. Price per session varies by area.',
            duration: 30,
            price: 150.00,
            status: 'ACTIVE'
          },
          {
            name: 'Laser Skin Resurfacing',
            description: 'Fractional laser treatment to improve skin texture, tone, and reduce scarring.',
            duration: 60,
            price: 350.00,
            status: 'ACTIVE'
          },
          {
            name: 'IPL Photofacial',
            description: 'Intense Pulsed Light treatment for sun damage, redness, and pigmentation.',
            duration: 45,
            price: 275.00,
            status: 'ACTIVE'
          },
          {
            name: 'Laser Pigmentation Removal',
            description: 'Targeted laser treatment for dark spots, sun spots, and hyperpigmentation.',
            duration: 30,
            price: 200.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 5. Chemical Peels
  const specPeels = await prisma.specialization.create({
    data: {
      name: 'Chemical Peels',
      description: 'Professional chemical exfoliation treatments for skin renewal.',
      icon: 'Layers',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Light Chemical Peel',
            description: 'Gentle peel using alpha-hydroxy acids for mild exfoliation. No downtime required.',
            duration: 30,
            price: 100.00,
            status: 'ACTIVE'
          },
          {
            name: 'Medium Chemical Peel',
            description: 'TCA peel for moderate skin concerns. Expect 3-5 days of peeling.',
            duration: 45,
            price: 175.00,
            status: 'ACTIVE'
          },
          {
            name: 'Deep Chemical Peel',
            description: 'Intensive peel for significant skin rejuvenation. Requires consultation first.',
            duration: 60,
            price: 300.00,
            status: 'ACTIVE'
          },
          {
            name: 'Vitamin C Peel',
            description: 'Brightening peel with vitamin C to even skin tone and boost radiance.',
            duration: 30,
            price: 120.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 6. Body Treatments
  const specBody = await prisma.specialization.create({
    data: {
      name: 'Body Treatments',
      description: 'Skincare and contouring treatments for the body.',
      icon: 'User',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Body Contouring',
            description: 'Non-invasive body sculpting treatment to reduce fat and tighten skin.',
            duration: 60,
            price: 300.00,
            status: 'ACTIVE'
          },
          {
            name: 'Cellulite Treatment',
            description: 'Targeted treatment to reduce the appearance of cellulite using RF technology.',
            duration: 45,
            price: 200.00,
            status: 'ACTIVE'
          },
          {
            name: 'Body Scrub & Wrap',
            description: 'Full body exfoliation followed by a hydrating or detoxifying wrap.',
            duration: 90,
            price: 150.00,
            status: 'ACTIVE'
          },
          {
            name: 'Back Facial',
            description: 'Deep cleansing treatment for the back area. Great for back acne.',
            duration: 45,
            price: 95.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 7. Advanced Aesthetics
  const specAdvanced = await prisma.specialization.create({
    data: {
      name: 'Advanced Aesthetics',
      description: 'Cutting-edge cosmetic procedures and treatments.',
      icon: 'Star',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Microdermabrasion',
            description: 'Exfoliating treatment that removes dead skin cells for smoother, brighter skin.',
            duration: 45,
            price: 135.00,
            status: 'ACTIVE'
          },
          {
            name: 'LED Light Therapy',
            description: 'Multi-wavelength LED treatment for various skin concerns including aging and acne.',
            duration: 30,
            price: 85.00,
            status: 'ACTIVE'
          },
          {
            name: 'Oxygen Facial',
            description: 'Pressurized oxygen infusion with serums for instant hydration and glow.',
            duration: 45,
            price: 160.00,
            status: 'ACTIVE'
          },
          {
            name: 'Hydrafacial',
            description: 'Multi-step treatment that cleanses, extracts, and hydrates with patented technology.',
            duration: 60,
            price: 200.00,
            status: 'ACTIVE'
          },
          {
            name: 'PRP Facial (Vampire Facial)',
            description: 'Platelet-rich plasma treatment using your own blood to rejuvenate skin.',
            duration: 75,
            price: 450.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  // 8. Skin Consultation
  const specConsultation = await prisma.specialization.create({
    data: {
      name: 'Consultation Services',
      description: 'Professional skin analysis and treatment planning.',
      icon: 'MessageCircle',
      status: 'ACTIVE',
      treatments: {
        create: [
          {
            name: 'Initial Skin Consultation',
            description: 'Comprehensive skin analysis with personalized treatment recommendations.',
            duration: 30,
            price: 50.00,
            status: 'ACTIVE'
          },
          {
            name: 'Follow-up Consultation',
            description: 'Progress review and treatment plan adjustment.',
            duration: 20,
            price: 30.00,
            status: 'ACTIVE'
          },
          {
            name: 'Virtual Consultation',
            description: 'Online video consultation for initial assessment or follow-up.',
            duration: 30,
            price: 40.00,
            status: 'ACTIVE'
          }
        ]
      }
    },
    include: { treatments: true }
  });

  console.log('Created Specializations with Treatments:');
  console.log(`  - ${specGeneral.name}: ${specGeneral.treatments.length} treatments`);
  console.log(`  - ${specAntiAging.name}: ${specAntiAging.treatments.length} treatments`);
  console.log(`  - ${specAcne.name}: ${specAcne.treatments.length} treatments`);
  console.log(`  - ${specLaser.name}: ${specLaser.treatments.length} treatments`);
  console.log(`  - ${specPeels.name}: ${specPeels.treatments.length} treatments`);
  console.log(`  - ${specBody.name}: ${specBody.treatments.length} treatments`);
  console.log(`  - ${specAdvanced.name}: ${specAdvanced.treatments.length} treatments`);
  console.log(`  - ${specConsultation.name}: ${specConsultation.treatments.length} treatments`);

  const totalTreatments = 
    specGeneral.treatments.length + 
    specAntiAging.treatments.length + 
    specAcne.treatments.length + 
    specLaser.treatments.length + 
    specPeels.treatments.length + 
    specBody.treatments.length + 
    specAdvanced.treatments.length + 
    specConsultation.treatments.length;

  console.log(`Total Treatments: ${totalTreatments}`);

  // =====================
  // Create Doctors
  // =====================
  const doctorPassword = await bcrypt.hash('password123', 10);

  // Doctor 1 - General Skincare Specialist
  const doctor1User = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor1 = await prisma.doctor.create({
    data: {
      userId: doctor1User.id,
      specializationId: specGeneral.id,
      experience: 10,
      phone: '+1-555-0101',
      address: '123 Medical Center, Suite 100',
      status: 'ACTIVE'
    }
  });

  // Doctor 2 - Anti-Aging Specialist
  const doctor2User = await prisma.user.create({
    data: {
      name: 'Dr. Emily Chen',
      email: 'emily@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor2 = await prisma.doctor.create({
    data: {
      userId: doctor2User.id,
      specializationId: specAntiAging.id,
      experience: 12,
      phone: '+1-555-0102',
      address: '123 Medical Center, Suite 102',
      status: 'ACTIVE'
    }
  });

  // Doctor 3 - Acne Specialist
  const doctor3User = await prisma.user.create({
    data: {
      name: 'Dr. Michael Brown',
      email: 'michael@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor3 = await prisma.doctor.create({
    data: {
      userId: doctor3User.id,
      specializationId: specAcne.id,
      experience: 8,
      phone: '+1-555-0103',
      address: '123 Medical Center, Suite 103',
      status: 'ACTIVE'
    }
  });

  // Doctor 4 - Laser Specialist
  const doctor4User = await prisma.user.create({
    data: {
      name: 'Dr. Jennifer Lee',
      email: 'jennifer@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor4 = await prisma.doctor.create({
    data: {
      userId: doctor4User.id,
      specializationId: specLaser.id,
      experience: 7,
      phone: '+1-555-0104',
      address: '123 Medical Center, Suite 104',
      status: 'ACTIVE'
    }
  });

  // Doctor 5 - Advanced Aesthetics
  const doctor5User = await prisma.user.create({
    data: {
      name: 'Dr. Robert Wilson',
      email: 'robert@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor5 = await prisma.doctor.create({
    data: {
      userId: doctor5User.id,
      specializationId: specAdvanced.id,
      experience: 15,
      phone: '+1-555-0105',
      address: '123 Medical Center, Suite 105',
      status: 'ACTIVE'
    }
  });

  // Doctor 6 - Chemical Peels Specialist
  const doctor6User = await prisma.user.create({
    data: {
      name: 'Dr. Amanda Martinez',
      email: 'amanda@clinic.com',
      password: doctorPassword,
      role: 'DOCTOR_ADMIN'
    }
  });

  const doctor6 = await prisma.doctor.create({
    data: {
      userId: doctor6User.id,
      specializationId: specPeels.id,
      experience: 9,
      phone: '+1-555-0106',
      address: '123 Medical Center, Suite 106',
      status: 'ACTIVE'
    }
  });

  console.log('Created Doctors: 6');

  // =====================
  // Assign Treatments to Doctors
  // =====================
  // Doctors can perform treatments from their specialization + some general treatments

  const doctorTreatmentAssignments = [
    // Dr. Sarah Johnson - General Skincare (all her spec treatments + consultations)
    ...specGeneral.treatments.map(t => ({ doctorId: doctor1.id, treatmentId: t.id })),
    ...specConsultation.treatments.map(t => ({ doctorId: doctor1.id, treatmentId: t.id })),

    // Dr. Emily Chen - Anti-Aging (all her spec + some general + consultations)
    ...specAntiAging.treatments.map(t => ({ doctorId: doctor2.id, treatmentId: t.id })),
    { doctorId: doctor2.id, treatmentId: specGeneral.treatments[0].id }, // Basic Facial
    { doctorId: doctor2.id, treatmentId: specGeneral.treatments[2].id }, // Hydrating Facial
    ...specConsultation.treatments.map(t => ({ doctorId: doctor2.id, treatmentId: t.id })),

    // Dr. Michael Brown - Acne (all his spec + some general)
    ...specAcne.treatments.map(t => ({ doctorId: doctor3.id, treatmentId: t.id })),
    { doctorId: doctor3.id, treatmentId: specGeneral.treatments[1].id }, // Deep Cleansing
    { doctorId: doctor3.id, treatmentId: specPeels.treatments[0].id }, // Light Peel
    ...specConsultation.treatments.map(t => ({ doctorId: doctor3.id, treatmentId: t.id })),

    // Dr. Jennifer Lee - Laser (all her spec + some advanced)
    ...specLaser.treatments.map(t => ({ doctorId: doctor4.id, treatmentId: t.id })),
    { doctorId: doctor4.id, treatmentId: specAdvanced.treatments[1].id }, // LED Light
    ...specConsultation.treatments.map(t => ({ doctorId: doctor4.id, treatmentId: t.id })),

    // Dr. Robert Wilson - Advanced (all his spec + multiple from others)
    ...specAdvanced.treatments.map(t => ({ doctorId: doctor5.id, treatmentId: t.id })),
    { doctorId: doctor5.id, treatmentId: specGeneral.treatments[0].id }, // Basic Facial
    { doctorId: doctor5.id, treatmentId: specAntiAging.treatments[0].id }, // Anti-Aging Facial
    { doctorId: doctor5.id, treatmentId: specPeels.treatments[1].id }, // Medium Peel
    ...specConsultation.treatments.map(t => ({ doctorId: doctor5.id, treatmentId: t.id })),

    // Dr. Amanda Martinez - Chemical Peels (all her spec + some body)
    ...specPeels.treatments.map(t => ({ doctorId: doctor6.id, treatmentId: t.id })),
    { doctorId: doctor6.id, treatmentId: specBody.treatments[2].id }, // Body Scrub
    { doctorId: doctor6.id, treatmentId: specBody.treatments[3].id }, // Back Facial
    ...specConsultation.treatments.map(t => ({ doctorId: doctor6.id, treatmentId: t.id })),
  ];

  await prisma.doctorTreatment.createMany({
    data: doctorTreatmentAssignments,
    skipDuplicates: true
  });
  console.log('Assigned Treatments to Doctors');

  // =====================
  // Create Availability
  // =====================
  const doctors = [doctor1, doctor2, doctor3, doctor4, doctor5, doctor6];
  const availabilityData = [];

  doctors.forEach((doctor, index) => {
    const startHour = 9 + (index % 2);
    const endHour = 17 + (index % 2);

    // Monday to Friday
    for (let day = 1; day <= 5; day++) {
      availabilityData.push({
        doctorId: doctor.id,
        dayOfWeek: day,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        isBlocked: false
      });
    }

    // Some doctors work Saturday
    if (index < 4) {
      availabilityData.push({
        doctorId: doctor.id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '14:00',
        isBlocked: false
      });
    }
  });

  await prisma.availability.createMany({
    data: availabilityData,
    skipDuplicates: true
  });
  console.log('Created Availability');

  // =====================
  // Create Sample Appointments
  // =====================
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const appointments = [
    // Today
    {
      patientName: 'John Smith',
      patientPhone: '+1-555-1001',
      patientEmail: 'john@example.com',
      doctorId: doctor1.id,
      treatmentId: specGeneral.treatments[0].id, // Basic Facial
      dateTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
      status: 'CONFIRMED',
      notes: 'First visit, sensitive skin'
    },
    {
      patientName: 'Jane Doe',
      patientPhone: '+1-555-1002',
      patientEmail: 'jane@example.com',
      doctorId: doctor2.id,
      treatmentId: specAntiAging.treatments[0].id, // Anti-Aging Facial
      dateTime: new Date(today.getTime() + 3 * 60 * 60 * 1000),
      status: 'CONFIRMED',
      notes: 'Interested in Botox for future'
    },
    {
      patientName: 'Mike Wilson',
      patientPhone: '+1-555-1003',
      patientEmail: 'mike@example.com',
      doctorId: doctor3.id,
      treatmentId: specAcne.treatments[0].id, // Acne Facial
      dateTime: new Date(today.getTime() + 4 * 60 * 60 * 1000),
      status: 'PENDING',
      notes: null
    },

    // Tomorrow
    {
      patientName: 'Alice Johnson',
      patientPhone: '+1-555-1004',
      patientEmail: 'alice@example.com',
      doctorId: doctor4.id,
      treatmentId: specLaser.treatments[0].id, // Laser Hair Removal
      dateTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      status: 'CONFIRMED',
      notes: 'Session 3 of 6'
    },
    {
      patientName: 'Bob Brown',
      patientPhone: '+1-555-1005',
      patientEmail: 'bob@example.com',
      doctorId: doctor5.id,
      treatmentId: specAdvanced.treatments[3].id, // Hydrafacial
      dateTime: new Date(today.getTime() + 26 * 60 * 60 * 1000),
      status: 'PENDING',
      notes: 'Wedding next week'
    },

    // Past - Completed
    {
      patientName: 'Carol Davis',
      patientPhone: '+1-555-1006',
      patientEmail: 'carol@example.com',
      doctorId: doctor6.id,
      treatmentId: specPeels.treatments[1].id, // Medium Chemical Peel
      dateTime: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      notes: 'Excellent results, follow-up in 4 weeks'
    },
    {
      patientName: 'David Lee',
      patientPhone: '+1-555-1007',
      patientEmail: 'david@example.com',
      doctorId: doctor2.id,
      treatmentId: specAntiAging.treatments[2].id, // Botox
      dateTime: new Date(today.getTime() - 48 * 60 * 60 * 1000),
      status: 'COMPLETED',
      notes: 'Forehead and crow\'s feet treated'
    },
    {
      patientName: 'Emma Wilson',
      patientPhone: '+1-555-1008',
      patientEmail: 'emma@example.com',
      doctorId: doctor1.id,
      treatmentId: specGeneral.treatments[2].id, // Hydrating Facial
      dateTime: new Date(today.getTime() - 72 * 60 * 60 * 1000),
      status: 'COMPLETED',
      notes: 'Very satisfied with results'
    },

    // Past - Cancelled
    {
      patientName: 'Frank Miller',
      patientPhone: '+1-555-1009',
      patientEmail: 'frank@example.com',
      doctorId: doctor3.id,
      treatmentId: specAcne.treatments[1].id, // Acne Scar Treatment
      dateTime: new Date(today.getTime() - 96 * 60 * 60 * 1000),
      status: 'CANCELLED',
      notes: 'Patient cancelled - illness'
    },

    // Future - Next Week
    {
      patientName: 'Grace Taylor',
      patientPhone: '+1-555-1010',
      patientEmail: 'grace@example.com',
      doctorId: doctor5.id,
      treatmentId: specAdvanced.treatments[4].id, // PRP Facial
      dateTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'CONFIRMED',
      notes: 'First PRP session'
    },
    {
      patientName: 'Henry Adams',
      patientPhone: '+1-555-1011',
      patientEmail: 'henry@example.com',
      doctorId: doctor4.id,
      treatmentId: specLaser.treatments[2].id, // IPL Photofacial
      dateTime: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      notes: 'Sun damage treatment'
    }
  ];

  await prisma.appointment.createMany({
    data: appointments,
    skipDuplicates: true
  });
  console.log('Created Appointments:', appointments.length);

  // =====================
  // Create Sample Blogs
  // =====================
  const blogs = [
    {
      title: '10 Tips for Healthy Glowing Skin',
      slug: '10-tips-for-healthy-glowing-skin',
      content: `<h2>Introduction</h2><p>Achieving healthy, glowing skin doesn't have to be complicated...</p>`,
      authorId: superAdmin.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Understanding Chemical Peels: A Complete Guide',
      slug: 'understanding-chemical-peels-guide',
      content: `<h2>What Are Chemical Peels?</h2><p>Chemical peels are one of the most effective treatments...</p>`,
      authorId: doctor6User.id,
      status: 'PUBLISHED'
    },
    {
      title: 'The Science Behind Anti-Aging Treatments',
      slug: 'science-behind-anti-aging-treatments',
      content: `<h2>Understanding Skin Aging</h2><p>As we age, our skin undergoes various changes...</p>`,
      authorId: doctor2User.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Laser Treatments: What You Need to Know',
      slug: 'laser-treatments-what-you-need-to-know',
      content: `<h2>Types of Laser Treatments</h2><p>Laser technology has revolutionized skincare...</p>`,
      authorId: doctor4User.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Managing Acne: Professional Treatment Options',
      slug: 'managing-acne-professional-treatments',
      content: `<h2>Understanding Acne</h2><p>Acne affects millions of people worldwide...</p>`,
      authorId: doctor3User.id,
      status: 'DRAFT'
    }
  ];

  await prisma.blog.createMany({
    data: blogs,
    skipDuplicates: true
  });
  console.log('Created Blogs:', blogs.length);

  // =====================
  // Create Settings
  // =====================
  await prisma.settings.create({
    data: {
      clinicName: 'Radiance Skincare Clinic',
      email: 'info@radianceclinic.com',
      phone: '+1-555-0100',
      address: '123 Medical Center, Healthcare City, HC 12345',
      timezone: 'America/New_York',
      slotDuration: 30,
      bookingBuffer: 60
    }
  });
  console.log('Created Settings');

  // =====================
  // Summary
  // =====================
  console.log('\n========================================');
  console.log('🌟 Seed completed successfully!');
  console.log('========================================');
  console.log('\n📊 Data Summary:');
  console.log('----------------------------------------');
  console.log(`  Specializations: 8`);
  console.log(`  Treatments: ${totalTreatments}`);
  console.log(`  Users: 7 (1 Admin + 6 Doctors)`);
  console.log(`  Doctors: 6`);
  console.log(`  Appointments: ${appointments.length}`);
  console.log(`  Blogs: ${blogs.length}`);
  console.log(`  Settings: 1`);
  
  console.log('\n📋 Specializations & Treatments:');
  console.log('----------------------------------------');
  console.log(`  ${specGeneral.name}: ${specGeneral.treatments.length} treatments`);
  console.log(`  ${specAntiAging.name}: ${specAntiAging.treatments.length} treatments`);
  console.log(`  ${specAcne.name}: ${specAcne.treatments.length} treatments`);
  console.log(`  ${specLaser.name}: ${specLaser.treatments.length} treatments`);
  console.log(`  ${specPeels.name}: ${specPeels.treatments.length} treatments`);
  console.log(`  ${specBody.name}: ${specBody.treatments.length} treatments`);
  console.log(`  ${specAdvanced.name}: ${specAdvanced.treatments.length} treatments`);
  console.log(`  ${specConsultation.name}: ${specConsultation.treatments.length} treatments`);

  console.log('\n🔐 Login Credentials:');
  console.log('----------------------------------------');
  console.log('Super Admin:');
  console.log('  📧 Email: admin@clinic.com');
  console.log('  🔑 Password: password123');
  console.log('\nDoctors:');
  console.log('  👩‍⚕️ Dr. Sarah Johnson (General Skincare)');
  console.log('     📧 sarah@clinic.com | 🔑 password123');
  console.log('  👩‍⚕️ Dr. Emily Chen (Anti-Aging)');
  console.log('     📧 emily@clinic.com | 🔑 password123');
  console.log('  👨‍⚕️ Dr. Michael Brown (Acne Treatment)');
  console.log('     📧 michael@clinic.com | 🔑 password123');
  console.log('  👩‍⚕️ Dr. Jennifer Lee (Laser Treatments)');
  console.log('     📧 jennifer@clinic.com | 🔑 password123');
  console.log('  👨‍⚕️ Dr. Robert Wilson (Advanced Aesthetics)');
  console.log('     📧 robert@clinic.com | 🔑 password123');
  console.log('  👩‍⚕️ Dr. Amanda Martinez (Chemical Peels)');
  console.log('     📧 amanda@clinic.com | 🔑 password123');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });