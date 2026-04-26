import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Migrating className strings to SchoolClass records...');

  // 1. Get all unique classNames from Student and Timetable
  const studentClasses = await prisma.student.findMany({ select: { className: true } });
  const timetableClasses = await prisma.timetable.findMany({ select: { className: true } });
  
  const allNames = new Set([
    ...studentClasses.map(s => s.className).filter(Boolean),
    ...timetableClasses.map(t => t.className).filter(Boolean),
    '5th Std', '6th Std', '7th Std', '8th Std', '9th Std', '10th Std'
  ]);

  console.log(`Found ${allNames.size} unique classes to create.`);

  // 2. Create SchoolClass records
  for (const name of allNames) {
    if (!name) continue;
    await prisma.schoolClass.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    console.log(`✅ Class created: ${name}`);
  }

  // 3. Link Students
  const schoolClasses = await prisma.schoolClass.findMany();
  for (const sc of schoolClasses) {
    await prisma.student.updateMany({
      where: { className: sc.name },
      data: { schoolClassId: sc.id }
    });
    await prisma.timetable.updateMany({
      where: { className: sc.name },
      data: { schoolClassId: sc.id }
    });
    await prisma.exam.updateMany({
      where: { className: sc.name },
      data: { schoolClassId: sc.id }
    });
  }

  console.log('🎉 Migration complete!');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
