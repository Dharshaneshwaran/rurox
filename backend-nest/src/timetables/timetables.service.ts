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
    const { teacherId, day, period, subject, className, room } = payload;
    const timetable = await this.prisma.timetable.upsert({
      where: { teacherId_day_period: { teacherId, day, period } },
      update: { subject, className, room: room ?? null },
      create: { teacherId, day, period, subject, className, room },
    });

    return { timetable };
  }
}
