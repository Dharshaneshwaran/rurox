import { Injectable } from '@nestjs/common';
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
    const specialClass = await this.prisma.specialClass.create({
      data: {
        teacherId: payload.teacherId,
        date: new Date(payload.date),
        fromTime: payload.fromTime,
        toTime: payload.toTime,
        subject: payload.subject,
        className: payload.className,
        notes: payload.notes ?? null,
      },
    });

    return { specialClass };
  }
}
