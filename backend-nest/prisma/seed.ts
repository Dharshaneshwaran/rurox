import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const TEACHERS = [
  { name: 'Alice Johnson', email: 'alice@example.com', subjects: ['Math', 'Physics'] },
  { name: 'Bob Smith', email: 'bob@example.com', subjects: ['Chemistry', 'Biology'] },
  { name: 'Carol Williams', email: 'carol@example.com', subjects: ['English', 'History'] },
  { name: 'David Brown', email: 'david@example.com', subjects: ['Computer Science', 'Math'] },
  { name: 'Eva Martinez', email: 'eva@example.com', subjects: ['Physics', 'Chemistry'] },
  { name: 'Frank Davis', email: 'frank@example.com', subjects: ['History', 'Geography'] },
  { name: 'Grace Wilson', email: 'grace@example.com', subjects: ['Biology', 'English'] },
  { name: 'Henry Taylor', email: 'henry@example.com', subjects: ['Geography', 'Computer Science'] },
];

const CLASSES = ['8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B'];
const ROOMS = ['R101', 'R102', 'R103', 'R104', 'R201', 'R202', 'R203', 'R204'];

// Each teacher's schedule: [day][period] = { subject, className, room } or null (free)
// Periods are 1-8. Teachers teach 5-6 periods/day leaving 2-3 free.
const SCHEDULES: Record<
  number,
  Record<Day, (null | { subject: string; className: string; room: string })[]>
> = {
  // Alice Johnson - Math, Physics (6 periods/day)
  0: {
    MON: [
      { subject: 'Math', className: '10A', room: 'R101' },
      { subject: 'Physics', className: '10B', room: 'R201' },
      { subject: 'Math', className: '9A', room: 'R101' },
      null,
      { subject: 'Physics', className: '11A', room: 'R201' },
      { subject: 'Math', className: '8A', room: 'R101' },
      null,
      { subject: 'Math', className: '11B', room: 'R102' },
    ],
    TUE: [
      { subject: 'Physics', className: '10A', room: 'R201' },
      { subject: 'Math', className: '10B', room: 'R101' },
      null,
      { subject: 'Math', className: '9B', room: 'R102' },
      { subject: 'Physics', className: '8B', room: 'R201' },
      { subject: 'Math', className: '11A', room: 'R101' },
      null,
      { subject: 'Physics', className: '9A', room: 'R202' },
    ],
    WED: [
      { subject: 'Math', className: '8A', room: 'R101' },
      null,
      { subject: 'Physics', className: '10A', room: 'R201' },
      { subject: 'Math', className: '10B', room: 'R101' },
      null,
      { subject: 'Math', className: '9A', room: 'R102' },
      { subject: 'Physics', className: '11B', room: 'R201' },
      { subject: 'Math', className: '11A', room: 'R101' },
    ],
    THU: [
      null,
      { subject: 'Math', className: '10A', room: 'R101' },
      { subject: 'Physics', className: '9B', room: 'R201' },
      { subject: 'Math', className: '8B', room: 'R102' },
      { subject: 'Physics', className: '10B', room: 'R201' },
      null,
      { subject: 'Math', className: '11A', room: 'R101' },
      { subject: 'Physics', className: '11B', room: 'R202' },
    ],
    FRI: [
      { subject: 'Math', className: '9A', room: 'R101' },
      { subject: 'Physics', className: '10A', room: 'R201' },
      { subject: 'Math', className: '10B', room: 'R101' },
      null,
      { subject: 'Math', className: '8A', room: 'R102' },
      { subject: 'Physics', className: '11A', room: 'R201' },
      null,
      { subject: 'Math', className: '9B', room: 'R101' },
    ],
  },
  // Bob Smith - Chemistry, Biology (6 periods/day)
  1: {
    MON: [
      null,
      { subject: 'Chemistry', className: '10A', room: 'R103' },
      { subject: 'Biology', className: '9B', room: 'R203' },
      { subject: 'Chemistry', className: '11A', room: 'R103' },
      { subject: 'Biology', className: '8A', room: 'R203' },
      null,
      { subject: 'Chemistry', className: '9A', room: 'R103' },
      { subject: 'Biology', className: '10B', room: 'R203' },
    ],
    TUE: [
      { subject: 'Biology', className: '10A', room: 'R203' },
      null,
      { subject: 'Chemistry', className: '8B', room: 'R103' },
      { subject: 'Biology', className: '11B', room: 'R203' },
      { subject: 'Chemistry', className: '10B', room: 'R103' },
      { subject: 'Biology', className: '9A', room: 'R203' },
      null,
      { subject: 'Chemistry', className: '11A', room: 'R104' },
    ],
    WED: [
      { subject: 'Chemistry', className: '9A', room: 'R103' },
      { subject: 'Biology', className: '10A', room: 'R203' },
      null,
      { subject: 'Chemistry', className: '10B', room: 'R103' },
      { subject: 'Biology', className: '8B', room: 'R203' },
      { subject: 'Chemistry', className: '11B', room: 'R103' },
      null,
      { subject: 'Biology', className: '9B', room: 'R204' },
    ],
    THU: [
      { subject: 'Biology', className: '11A', room: 'R203' },
      { subject: 'Chemistry', className: '9B', room: 'R103' },
      null,
      { subject: 'Biology', className: '10A', room: 'R203' },
      null,
      { subject: 'Chemistry', className: '8A', room: 'R103' },
      { subject: 'Biology', className: '10B', room: 'R203' },
      { subject: 'Chemistry', className: '11B', room: 'R104' },
    ],
    FRI: [
      { subject: 'Chemistry', className: '10A', room: 'R103' },
      { subject: 'Biology', className: '9A', room: 'R203' },
      { subject: 'Chemistry', className: '11A', room: 'R103' },
      null,
      { subject: 'Biology', className: '8A', room: 'R203' },
      null,
      { subject: 'Chemistry', className: '10B', room: 'R103' },
      { subject: 'Biology', className: '11B', room: 'R204' },
    ],
  },
  // Carol Williams - English, History (5 periods/day)
  2: {
    MON: [
      { subject: 'English', className: '8A', room: 'R104' },
      null,
      { subject: 'History', className: '10A', room: 'R204' },
      { subject: 'English', className: '11A', room: 'R104' },
      null,
      { subject: 'History', className: '9B', room: 'R204' },
      { subject: 'English', className: '10B', room: 'R104' },
      null,
    ],
    TUE: [
      null,
      { subject: 'English', className: '9A', room: 'R104' },
      { subject: 'History', className: '11B', room: 'R204' },
      null,
      { subject: 'English', className: '8B', room: 'R104' },
      { subject: 'History', className: '10A', room: 'R204' },
      { subject: 'English', className: '10B', room: 'R104' },
      null,
    ],
    WED: [
      { subject: 'History', className: '9A', room: 'R204' },
      { subject: 'English', className: '11A', room: 'R104' },
      { subject: 'English', className: '8A', room: 'R104' },
      null,
      { subject: 'History', className: '10B', room: 'R204' },
      null,
      { subject: 'English', className: '9B', room: 'R104' },
      null,
    ],
    THU: [
      { subject: 'English', className: '10A', room: 'R104' },
      null,
      { subject: 'History', className: '8B', room: 'R204' },
      { subject: 'English', className: '11B', room: 'R104' },
      { subject: 'History', className: '9A', room: 'R204' },
      null,
      null,
      { subject: 'English', className: '9B', room: 'R104' },
    ],
    FRI: [
      null,
      { subject: 'History', className: '11A', room: 'R204' },
      null,
      { subject: 'English', className: '10A', room: 'R104' },
      { subject: 'English', className: '8A', room: 'R104' },
      { subject: 'History', className: '9B', room: 'R204' },
      { subject: 'English', className: '11B', room: 'R104' },
      null,
    ],
  },
  // David Brown - Computer Science, Math (5 periods/day)
  3: {
    MON: [
      { subject: 'Computer Science', className: '10B', room: 'R202' },
      { subject: 'Math', className: '8B', room: 'R102' },
      null,
      { subject: 'Computer Science', className: '11B', room: 'R202' },
      { subject: 'Math', className: '9B', room: 'R102' },
      null,
      { subject: 'Computer Science', className: '9A', room: 'R202' },
      null,
    ],
    TUE: [
      null,
      { subject: 'Computer Science', className: '10A', room: 'R202' },
      { subject: 'Math', className: '11A', room: 'R102' },
      null,
      { subject: 'Computer Science', className: '8A', room: 'R202' },
      { subject: 'Math', className: '9B', room: 'R102' },
      { subject: 'Computer Science', className: '11B', room: 'R202' },
      null,
    ],
    WED: [
      null,
      { subject: 'Math', className: '10A', room: 'R102' },
      { subject: 'Computer Science', className: '9B', room: 'R202' },
      { subject: 'Math', className: '8B', room: 'R102' },
      { subject: 'Computer Science', className: '11A', room: 'R202' },
      null,
      { subject: 'Math', className: '9A', room: 'R102' },
      null,
    ],
    THU: [
      { subject: 'Computer Science', className: '10A', room: 'R202' },
      { subject: 'Math', className: '11B', room: 'R102' },
      { subject: 'Computer Science', className: '8A', room: 'R202' },
      null,
      null,
      { subject: 'Math', className: '10B', room: 'R102' },
      { subject: 'Computer Science', className: '9B', room: 'R202' },
      null,
    ],
    FRI: [
      { subject: 'Math', className: '8B', room: 'R102' },
      null,
      { subject: 'Computer Science', className: '10B', room: 'R202' },
      { subject: 'Math', className: '11A', room: 'R102' },
      null,
      { subject: 'Computer Science', className: '9A', room: 'R202' },
      { subject: 'Math', className: '10A', room: 'R102' },
      null,
    ],
  },
  // Eva Martinez - Physics, Chemistry (5 periods/day)
  4: {
    MON: [
      { subject: 'Physics', className: '9B', room: 'R201' },
      null,
      { subject: 'Chemistry', className: '10B', room: 'R103' },
      { subject: 'Physics', className: '8B', room: 'R201' },
      null,
      { subject: 'Chemistry', className: '11B', room: 'R104' },
      { subject: 'Physics', className: '10A', room: 'R201' },
      null,
    ],
    TUE: [
      { subject: 'Chemistry', className: '9B', room: 'R103' },
      { subject: 'Physics', className: '11A', room: 'R201' },
      null,
      { subject: 'Chemistry', className: '8A', room: 'R104' },
      null,
      { subject: 'Physics', className: '10B', room: 'R201' },
      { subject: 'Chemistry', className: '10A', room: 'R103' },
      null,
    ],
    WED: [
      null,
      { subject: 'Physics', className: '9A', room: 'R201' },
      { subject: 'Chemistry', className: '11A', room: 'R103' },
      null,
      { subject: 'Physics', className: '8A', room: 'R201' },
      { subject: 'Chemistry', className: '10A', room: 'R104' },
      { subject: 'Physics', className: '10B', room: 'R201' },
      null,
    ],
    THU: [
      { subject: 'Chemistry', className: '10A', room: 'R103' },
      null,
      { subject: 'Physics', className: '11B', room: 'R201' },
      { subject: 'Chemistry', className: '9A', room: 'R104' },
      { subject: 'Physics', className: '8B', room: 'R201' },
      null,
      null,
      { subject: 'Chemistry', className: '10B', room: 'R103' },
    ],
    FRI: [
      null,
      { subject: 'Physics', className: '9B', room: 'R201' },
      { subject: 'Chemistry', className: '8B', room: 'R103' },
      { subject: 'Physics', className: '11B', room: 'R201' },
      { subject: 'Chemistry', className: '10A', room: 'R104' },
      null,
      { subject: 'Physics', className: '10B', room: 'R201' },
      null,
    ],
  },
  // Frank Davis - History, Geography (4 periods/day)
  5: {
    MON: [
      null,
      { subject: 'History', className: '8A', room: 'R204' },
      null,
      { subject: 'Geography', className: '10A', room: 'R204' },
      { subject: 'History', className: '11B', room: 'R204' },
      null,
      null,
      { subject: 'Geography', className: '9A', room: 'R204' },
    ],
    TUE: [
      { subject: 'Geography', className: '10B', room: 'R204' },
      null,
      { subject: 'History', className: '9A', room: 'R204' },
      null,
      null,
      { subject: 'Geography', className: '8A', room: 'R204' },
      { subject: 'History', className: '11A', room: 'R204' },
      null,
    ],
    WED: [
      null,
      null,
      { subject: 'Geography', className: '9B', room: 'R204' },
      { subject: 'History', className: '10A', room: 'R204' },
      null,
      { subject: 'Geography', className: '11B', room: 'R204' },
      null,
      { subject: 'History', className: '8B', room: 'R204' },
    ],
    THU: [
      { subject: 'History', className: '10B', room: 'R204' },
      null,
      null,
      { subject: 'Geography', className: '11A', room: 'R204' },
      { subject: 'History', className: '9B', room: 'R204' },
      null,
      { subject: 'Geography', className: '8A', room: 'R204' },
      null,
    ],
    FRI: [
      { subject: 'Geography', className: '10A', room: 'R204' },
      null,
      null,
      { subject: 'History', className: '11B', room: 'R204' },
      null,
      { subject: 'Geography', className: '9A', room: 'R204' },
      null,
      { subject: 'History', className: '8A', room: 'R204' },
    ],
  },
  // Grace Wilson - Biology, English (5 periods/day)
  6: {
    MON: [
      null,
      { subject: 'Biology', className: '11A', room: 'R203' },
      { subject: 'English', className: '9A', room: 'R104' },
      null,
      { subject: 'Biology', className: '10A', room: 'R203' },
      { subject: 'English', className: '8B', room: 'R104' },
      { subject: 'Biology', className: '9B', room: 'R203' },
      null,
    ],
    TUE: [
      { subject: 'English', className: '11A', room: 'R104' },
      null,
      { subject: 'Biology', className: '10B', room: 'R203' },
      { subject: 'English', className: '8A', room: 'R104' },
      null,
      null,
      { subject: 'Biology', className: '9A', room: 'R203' },
      { subject: 'English', className: '10A', room: 'R104' },
    ],
    WED: [
      { subject: 'Biology', className: '8B', room: 'R203' },
      null,
      null,
      { subject: 'English', className: '10A', room: 'R104' },
      { subject: 'Biology', className: '11B', room: 'R203' },
      { subject: 'English', className: '9A', room: 'R104' },
      null,
      { subject: 'Biology', className: '10B', room: 'R203' },
    ],
    THU: [
      null,
      { subject: 'Biology', className: '9A', room: 'R203' },
      { subject: 'English', className: '11A', room: 'R104' },
      null,
      { subject: 'Biology', className: '8A', room: 'R203' },
      { subject: 'English', className: '10B', room: 'R104' },
      null,
      { subject: 'Biology', className: '11B', room: 'R203' },
    ],
    FRI: [
      { subject: 'English', className: '9B', room: 'R104' },
      { subject: 'Biology', className: '10A', room: 'R203' },
      null,
      { subject: 'English', className: '8B', room: 'R104' },
      { subject: 'Biology', className: '11A', room: 'R203' },
      null,
      null,
      { subject: 'English', className: '10B', room: 'R104' },
    ],
  },
  // Henry Taylor - Geography, Computer Science (4 periods/day)
  7: {
    MON: [
      null,
      null,
      { subject: 'Geography', className: '11A', room: 'R204' },
      { subject: 'Computer Science', className: '8A', room: 'R202' },
      null,
      { subject: 'Geography', className: '10B', room: 'R204' },
      null,
      { subject: 'Computer Science', className: '11A', room: 'R202' },
    ],
    TUE: [
      { subject: 'Computer Science', className: '9A', room: 'R202' },
      { subject: 'Geography', className: '11B', room: 'R204' },
      null,
      null,
      { subject: 'Computer Science', className: '10B', room: 'R202' },
      null,
      null,
      { subject: 'Geography', className: '8B', room: 'R204' },
    ],
    WED: [
      { subject: 'Geography', className: '10A', room: 'R204' },
      null,
      null,
      { subject: 'Computer Science', className: '9A', room: 'R202' },
      null,
      { subject: 'Geography', className: '8B', room: 'R204' },
      { subject: 'Computer Science', className: '11B', room: 'R202' },
      null,
    ],
    THU: [
      null,
      { subject: 'Geography', className: '9A', room: 'R204' },
      { subject: 'Computer Science', className: '10B', room: 'R202' },
      null,
      { subject: 'Geography', className: '11B', room: 'R204' },
      { subject: 'Computer Science', className: '8B', room: 'R202' },
      null,
      null,
    ],
    FRI: [
      null,
      { subject: 'Computer Science', className: '8A', room: 'R202' },
      { subject: 'Geography', className: '11A', room: 'R204' },
      null,
      { subject: 'Computer Science', className: '9B', room: 'R202' },
      null,
      { subject: 'Geography', className: '10B', room: 'R204' },
      null,
    ],
  },
};

const seed = async () => {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('adminpass', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'Admin User', password: adminPassword, role: 'ADMIN', approved: true },
    create: { name: 'Admin User', email: 'admin@example.com', password: adminPassword, role: 'ADMIN', approved: true },
  });
  console.log('✅ Admin user created');

  const studentPassword = await bcrypt.hash('studentpass', 10);
  await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: { name: 'Student User', password: studentPassword, role: 'STUDENT', approved: true },
    create: { name: 'Student User', email: 'student@example.com', password: studentPassword, role: 'STUDENT', approved: true },
  });
  console.log('✅ Student user created');

  // 2. Create teachers + user accounts
  const teacherPassword = await bcrypt.hash('teacherpass', 10);
  const teacherRecords: { id: string; name: string }[] = [];

  for (const t of TEACHERS) {
    const existing = await prisma.teacher.findFirst({ where: { name: t.name } });
    const teacher = existing
      ? await prisma.teacher.update({ where: { id: existing.id }, data: { subjects: t.subjects } })
      : await prisma.teacher.create({ data: { name: t.name, subjects: t.subjects } });

    await prisma.user.upsert({
      where: { email: t.email },
      update: { name: t.name, password: teacherPassword, role: 'TEACHER', teacherId: teacher.id, approved: true },
      create: { name: t.name, email: t.email, password: teacherPassword, role: 'TEACHER', teacherId: teacher.id, approved: true },
    });

    teacherRecords.push(teacher);
    console.log(`✅ Teacher ${t.name} created`);
  }

  // 3. Create timetable entries
  let timetableCount = 0;
  for (let idx = 0; idx < teacherRecords.length; idx++) {
    const teacher = teacherRecords[idx];
    const schedule = SCHEDULES[idx];
    if (!schedule) continue;

    for (const day of DAYS) {
      const daySlots = schedule[day];
      for (let periodIdx = 0; periodIdx < daySlots.length; periodIdx++) {
        const slot = daySlots[periodIdx];
        if (!slot) continue;

        const period = periodIdx + 1;
        await prisma.timetable.upsert({
          where: { teacherId_day_period: { teacherId: teacher.id, day, period } },
          update: { subject: slot.subject, className: slot.className, room: slot.room },
          create: { teacherId: teacher.id, day, period, subject: slot.subject, className: slot.className, room: slot.room },
        });
        timetableCount++;
      }
    }
  }
  console.log(`✅ ${timetableCount} timetable entries created`);

  // 4. Create sample special class
  const aliceTeacher = teacherRecords[0];
  const existingSpecial = await prisma.specialClass.findFirst({
    where: { teacherId: aliceTeacher.id, subject: 'Math', className: '10A', fromTime: '16:00' },
  });
  if (!existingSpecial) {
    await prisma.specialClass.create({
      data: {
        teacherId: aliceTeacher.id,
        date: new Date(),
        fromTime: '16:00',
        toTime: '17:00',
        subject: 'Math',
        className: '10A',
        notes: 'Extra practice session for board exams',
      },
    });
    console.log('✅ Sample special class created');
  }

  console.log('🎉 Seed complete!');
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
