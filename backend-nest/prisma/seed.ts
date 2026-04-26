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
  { name: 'Ivy Chen', email: 'ivy@example.com', subjects: ['Math', 'Art'] },
  { name: 'Jack Miller', email: 'jack@example.com', subjects: ['Science', 'Physical Education'] },
];

const CLASSES = ['5th Std', '6th Std', '7th Std', '8th Std', '9th Std'];

const STUDENTS = [
  { name: 'Aryan Sharma', email: 'aryan@example.com', rollNumber: 'S101', className: '5th Std' },
  { name: 'Diya Patel', email: 'diya@example.com', rollNumber: 'S102', className: '5th Std' },
  { name: 'Kabir Singh', email: 'kabir@example.com', rollNumber: 'S103', className: '6th Std' },
  { name: 'Ananya Rao', email: 'ananya@example.com', rollNumber: 'S104', className: '6th Std' },
  { name: 'Ishaan Gupta', email: 'ishaan@example.com', rollNumber: 'S105', className: '7th Std' },
  { name: 'Myra Khan', email: 'myra@example.com', rollNumber: 'S106', className: '7th Std' },
  { name: 'Rohan Verma', email: 'rohan@example.com', rollNumber: 'S107', className: '8th Std' },
  { name: 'Sia Malhotra', email: 'sia@example.com', rollNumber: 'S108', className: '8th Std' },
  { name: 'Vihaan Jain', email: 'vihaan@example.com', rollNumber: 'S109', className: '9th Std' },
  { name: 'Zoya Ahmed', email: 'zoya@example.com', rollNumber: 'S110', className: '9th Std' },
];

const seed = async () => {
  console.log('🌱 Seeding database...');

  // 1. Admin
  const adminPassword = await bcrypt.hash('adminpass', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { name: 'Admin User', password: adminPassword, role: 'ADMIN', approved: true },
    create: { name: 'Admin User', email: 'admin@example.com', password: adminPassword, role: 'ADMIN', approved: true },
  });

  // 2. Teachers
  const teacherPassword = await bcrypt.hash('teacherpass', 10);
  const teacherRecords: any[] = [];
  for (const t of TEACHERS) {
    const teacher = await prisma.teacher.upsert({
      where: { id: t.email }, // Using email as temp id for upsert if needed, or find by name
      update: { name: t.name, subjects: t.subjects },
      create: { name: t.name, subjects: t.subjects },
    });
    await prisma.user.upsert({
      where: { email: t.email },
      update: { name: t.name, password: teacherPassword, role: 'TEACHER', teacherId: teacher.id, approved: true },
      create: { name: t.name, email: t.email, password: teacherPassword, role: 'TEACHER', teacherId: teacher.id, approved: true },
    });
    teacherRecords.push(teacher);
  }
  console.log('✅ 10 Teachers created');

  // 3. School Classes
  console.log('🏫 Creating School Classes...');
  const schoolClassRecords: Record<string, any> = {};
  for (let i = 0; i < CLASSES.length; i++) {
    const className = CLASSES[i];
    const teacher = teacherRecords[i]; // Assign first 5 teachers as class teachers
    const sc = await prisma.schoolClass.upsert({
      where: { name: className },
      update: { teacherId: teacher.id },
      create: { name: className, teacherId: teacher.id },
    });
    schoolClassRecords[className] = sc;
  }

  // 4. Timetables (Teacher schedules)
  // Let's assign Alice, Bob, Carol, David, and Eva to their respective classes
  for (let i = 0; i < CLASSES.length; i++) {
    const className = CLASSES[i];
    const teacher = teacherRecords[i];
    const schoolClass = schoolClassRecords[className];
    const subject = TEACHERS[i].subjects[0];

    for (const day of DAYS) {
      for (let p = 1; p <= 4; p++) { // 4 periods per day for seed
        await prisma.timetable.upsert({
          where: { teacherId_day_period: { teacherId: teacher.id, day, period: p } },
          update: { subject, className, schoolClassId: schoolClass.id, room: `Room ${i + 1}0${p}` },
          create: { teacherId: teacher.id, day, period: p, subject, className, schoolClassId: schoolClass.id, room: `Room ${i + 1}0${p}` },
        });
      }
    }
  }
  console.log('✅ Timetables created for all classes');

  // 5. Students
  const studentPassword = await bcrypt.hash('studentpass', 10);
  for (const s of STUDENTS) {
    const schoolClass = schoolClassRecords[s.className];
    const student = await prisma.student.upsert({
      where: { rollNumber: s.rollNumber },
      update: { name: s.name, className: s.className, schoolClassId: schoolClass.id },
      create: { name: s.name, rollNumber: s.rollNumber, className: s.className, schoolClassId: schoolClass.id },
    });
    await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, password: studentPassword, role: 'STUDENT', studentId: student.id, approved: true },
      create: { name: s.name, email: s.email, password: studentPassword, role: 'STUDENT', studentId: student.id, approved: true },
    });

    // Auto-sync timetable for EVERY student based on their class
    const classTimetable = await prisma.timetable.findMany({
      where: { schoolClassId: schoolClass.id },
      include: { teacher: true },
    });
    for (const entry of classTimetable) {
      await prisma.studentTimetable.upsert({
        where: { studentId_day_period: { studentId: student.id, day: entry.day, period: entry.period } },
        update: { 
          subject: entry.subject, 
          className: entry.className || s.className, 
          teacher: entry.teacher.name, 
          room: entry.room 
        },
        create: { 
          studentId: student.id, 
          day: entry.day, 
          period: entry.period, 
          subject: entry.subject, 
          className: entry.className || s.className, 
          teacher: entry.teacher.name, 
          room: entry.room 
        },
      });
    }
  }
  console.log('✅ 10 Students created and synced with their class timetables');

  console.log('🎉 Seed complete!');
};

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
