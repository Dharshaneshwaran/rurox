import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  const email = 'dharshaneshwaran@gmail.com';
  const teacherId = 'cmoeanigc0001bq3gx7bafwlo';
  const className = '10th Std';

  console.log(`🚀 Setting up heavy schedule for ${email}...`);

  // 1. Clear existing timetable
  await prisma.timetable.deleteMany({ where: { teacherId } });

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
  const subjects = ['Mathematics', 'Advanced Physics', 'Quantum Mechanics', 'Calculus', 'Linear Algebra'];
  
  // 2. Assign heavy schedule (8 periods total, only 1 free at period 4)
  for (const day of DAYS) {
    for (let p = 1; p <= 8; p++) {
      if (p === 4) continue; // Free period
      
      await prisma.timetable.create({
        data: {
          teacherId,
          day,
          period: p,
          subject: subjects[p % subjects.length],
          className,
          room: `Lab ${p + 10}`,
        }
      });
    }
  }
  console.log('✅ Heavy schedule assigned (7/8 periods filled daily)');

  // 3. Create 20 students for this class
  console.log(`👥 Creating 20 students for ${className}...`);
  const studentPassword = await bcrypt.hash('student123', 10);
  
  const classTimetable = await prisma.timetable.findMany({
    where: { className },
    include: { teacher: true }
  });

  for (let i = 1; i <= 20; i++) {
    const sName = `Student ${i}`;
    const sEmail = `student${i}.dharshan@example.com`;
    const roll = `D10${i.toString().padStart(2, '0')}`;

    const student = await prisma.student.upsert({
      where: { rollNumber: roll },
      update: { name: sName, className },
      create: { name: sName, rollNumber: roll, className },
    });

    await prisma.user.upsert({
      where: { email: sEmail },
      update: { name: sName, password: studentPassword, role: 'STUDENT', studentId: student.id, approved: true },
      create: { name: sName, email: sEmail, password: studentPassword, role: 'STUDENT', studentId: student.id, approved: true },
    });

    // Link student to teacher (Dharshan)
    await prisma.student.update({
      where: { id: student.id },
      data: { teachers: { connect: { id: teacherId } } }
    });

    // Sync timetable
    for (const entry of classTimetable) {
      await prisma.studentTimetable.upsert({
        where: { studentId_day_period: { studentId: student.id, day: entry.day, period: entry.period } },
        update: { subject: entry.subject, className: entry.className || className, teacher: entry.teacher.name, room: entry.room },
        create: { studentId: student.id, day: entry.day, period: entry.period, subject: entry.subject, className: entry.className || className, teacher: entry.teacher.name, room: entry.room },
      });
    }
  }

  console.log(`✅ 20 students created and synced with ${className} timetable.`);
  console.log('🎉 Done!');
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
