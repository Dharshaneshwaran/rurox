import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';
import { CreateSpecialClassDto } from './dto/create-special-class.dto';

@Injectable()
export class SpecialClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthUser, teacherId?: string) {
    if (user.role === 'ADMIN') {
      const specialClasses = await this.prisma.specialClass.findMany({
        where: { teacherId },
        include: { teacher: true },
      });
      return { specialClasses };
    }

    if (!user.teacherId) {
      return { specialClasses: [] };
    }

    const specialClasses = await this.prisma.specialClass.findMany({
      where: { teacherId: user.teacherId },
    });

    return { specialClasses };
  }

  async create(payload: CreateSpecialClassDto) {
    const specialClassDate = new Date(payload.date);
    const dayOfWeek = specialClassDate.getUTCDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const startOfDay = new Date(specialClassDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(specialClassDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existingClass = await this.prisma.specialClass.findFirst({
        where: {
          teacherId: payload.teacherId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingClass) {
        throw new ConflictException('A special class is already scheduled on this day (Monday-Friday limit: 1).');
      }
    }

    return await this.prisma.$transaction(async (prisma) => {
      const specialClass = await prisma.specialClass.create({
        data: {
          teacherId: payload.teacherId,
          date: specialClassDate,
          fromTime: payload.fromTime,
          toTime: payload.toTime,
          subject: payload.subject,
          className: payload.className,
          notes: payload.notes ?? null,
        },
      });

      if (payload.substituteTeacherId) {
        const dayMap = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI' };
        const dayStr = dayMap[dayOfWeek as keyof typeof dayMap] || 'MON'; // fallback
        
        await prisma.substitution.create({
          data: {
            absentTeacherId: payload.teacherId,
            replacementTeacherId: payload.substituteTeacherId,
            day: dayStr as any,
            date: specialClassDate,
            specialClassId: specialClass.id,
            status: 'PENDING',
            autoAssigned: false,
          }
        });

        await prisma.teacher.update({
          where: { id: payload.substituteTeacherId },
          data: { workload: { increment: 1 } },
        });
      }

      return { specialClass };
    });
  }
}
