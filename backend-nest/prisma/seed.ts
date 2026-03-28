import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seed = async () => {
  const adminPassword = await bcrypt.hash('adminpass', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const existingTeacherOne = await prisma.teacher.findFirst({
    where: { name: 'Alice Teacher' },
  });
  const teacherOne = existingTeacherOne
    ? existingTeacherOne
    : await prisma.teacher.create({
        data: {
          name: 'Alice Teacher',
          subjects: ['Math', 'Physics'],
        },
      });

  const existingTeacherTwo = await prisma.teacher.findFirst({
    where: { name: 'Bob Teacher' },
  });
  const teacherTwo = existingTeacherTwo
    ? existingTeacherTwo
    : await prisma.teacher.create({
        data: {
          name: 'Bob Teacher',
          subjects: ['Chemistry', 'Biology'],
        },
      });

  const teacherPassword = await bcrypt.hash('teacherpass', 10);

  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {
      name: 'Alice Teacher',
      password: teacherPassword,
      role: 'TEACHER',
      teacherId: teacherOne.id,
    },
    create: {
      name: 'Alice Teacher',
      email: 'alice@example.com',
      password: teacherPassword,
      role: 'TEACHER',
      teacherId: teacherOne.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {
      name: 'Bob Teacher',
      password: teacherPassword,
      role: 'TEACHER',
      teacherId: teacherTwo.id,
    },
    create: {
      name: 'Bob Teacher',
      email: 'bob@example.com',
      password: teacherPassword,
      role: 'TEACHER',
      teacherId: teacherTwo.id,
    },
  });

  const days: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'> = [
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
  ];

  for (const day of days) {
    for (let period = 1; period <= 4; period += 1) {
      await prisma.timetable.upsert({
        where: { teacherId_day_period: { teacherId: teacherOne.id, day, period } },
        update: {
          subject: period % 2 === 0 ? 'Physics' : 'Math',
          className: '10A',
          room: 'R101',
        },
        create: {
          teacherId: teacherOne.id,
          day,
          period,
          subject: period % 2 === 0 ? 'Physics' : 'Math',
          className: '10A',
          room: 'R101',
        },
      });
    }
  }

  const existingSpecial = await prisma.specialClass.findFirst({
    where: {
      teacherId: teacherOne.id,
      subject: 'Math',
      className: '10A',
      fromTime: '16:00',
      toTime: '17:00',
    },
  });
  if (!existingSpecial) {
    await prisma.specialClass.create({
      data: {
        teacherId: teacherOne.id,
        date: new Date(),
        fromTime: '16:00',
        toTime: '17:00',
        subject: 'Math',
        className: '10A',
        notes: 'Extra practice session',
      },
    });
  }

  const existingSubstitution = await prisma.substitution.findFirst({
    where: {
      absentTeacherId: teacherOne.id,
      replacementTeacherId: teacherTwo.id,
      day: 'MON',
      period: 2,
    },
  });
  if (!existingSubstitution) {
    await prisma.substitution.create({
      data: {
        absentTeacherId: teacherOne.id,
        replacementTeacherId: teacherTwo.id,
        day: 'MON',
        period: 2,
        date: new Date(),
        autoAssigned: true,
      },
    });
  }
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
