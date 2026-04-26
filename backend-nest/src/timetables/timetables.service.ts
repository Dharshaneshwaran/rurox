import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import type { AuthUser } from '../auth/auth.types';

@Injectable()
export class TimetablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    teacher?: string;
    subject?: string;
    className?: string;
    day?: string;
  }) {
    const { teacher, subject, className, day } = query;
    const timetables = await this.prisma.timetable.findMany({
      where: {
        day: day as any,
        subject: subject ? { contains: subject, mode: 'insensitive' } : undefined,
        className: className
          ? { contains: className, mode: 'insensitive' }
          : undefined,
        teacher: teacher
          ? { name: { contains: teacher, mode: 'insensitive' } }
          : undefined,
      },
      include: { teacher: true },
    });

    return { timetables };
  }

  async findMine(user: AuthUser) {
    if (user.role !== 'TEACHER') {
      throw new ForbiddenException('Forbidden');
    }
    if (!user.teacherId) {
      return { timetables: [] };
    }

    const timetables = await this.prisma.timetable.findMany({
      where: { teacherId: user.teacherId },
    });

    return { timetables };
  }

  async create(payload: CreateTimetableDto) {
    const { teacherId, day, period, subject, className, room, schoolClassId } = payload;
    
    return this.prisma.$transaction(async (tx) => {
      const timetable = await tx.timetable.upsert({
        where: { teacherId_day_period: { teacherId, day, period } },
        update: { subject, className, room: room ?? null, schoolClassId },
        create: { teacherId, day, period, subject, className, room, schoolClassId },
        include: { teacher: true }
      });

      // Sync to students in this class
      if (schoolClassId || className) {
        const students = await tx.student.findMany({
          where: {
            OR: [
              { schoolClassId: schoolClassId || undefined },
              { className: className || undefined }
            ]
          }
        });

        for (const student of students) {
          await tx.studentTimetable.upsert({
            where: { studentId_day_period: { studentId: student.id, day, period } },
            update: { 
              subject, 
              className: className || '', 
              teacher: timetable.teacher.name, 
              room: room || null 
            },
            create: { 
              studentId: student.id, 
              day, 
              period, 
              subject, 
              className: className || '', 
              teacher: timetable.teacher.name, 
              room: room || null 
            },
          });
        }
      }

      return { timetable };
    });
  }
}
