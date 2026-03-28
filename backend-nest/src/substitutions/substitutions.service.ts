import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';
import { BaseSubstitutionDto } from './dto/base-substitution.dto';
import { ManualSubstitutionDto } from './dto/manual-substitution.dto';

@Injectable()
export class SubstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findReplacement(params: {
    absentTeacherId: string;
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
    period: number;
    subject?: string;
    date: Date;
  }) {
    const teachers: Array<{
      id: string;
      name: string;
      subjects: string[];
      workload: number;
    }> = await this.prisma.teacher.findMany({
      where: {
        id: { not: params.absentTeacherId },
        timetables: { none: { day: params.day, period: params.period } },
      },
      select: { id: true, name: true, subjects: true, workload: true },
    });

    const existingAssignments: Array<{ replacementTeacherId: string | null }> =
      await this.prisma.substitution.findMany({
        where: {
          day: params.day,
          period: params.period,
          date: params.date,
          replacementTeacherId: { not: null },
        },
        select: { replacementTeacherId: true },
      });

    const unavailableIds = new Set<string>(
      existingAssignments
        .map((item: { replacementTeacherId: string | null }) => item.replacementTeacherId)
        .filter((id: string | null): id is string => Boolean(id))
    );

    const candidates = teachers.filter(
      (teacher: { id: string }) => !unavailableIds.has(teacher.id)
    );

    const scored = candidates
      .map((teacher: { id: string; subjects: string[]; workload: number }) => {
        const subjectMatch = params.subject
          ? teacher.subjects.includes(params.subject)
          : false;
        const score = (subjectMatch ? 100 : 0) - teacher.workload;
        return { teacher, score };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    return scored.length ? scored[0].teacher : null;
  }

  async findAll(user: AuthUser) {
    if (user.role === 'ADMIN') {
      const substitutions = await this.prisma.substitution.findMany({
        include: { absentTeacher: true, replacementTeacher: true },
      });
      return { substitutions };
    }

    if (!user.teacherId) {
      return { substitutions: [] };
    }

    const substitutions = await this.prisma.substitution.findMany({
      where: {
        OR: [
          { absentTeacherId: user.teacherId },
          { replacementTeacherId: user.teacherId },
        ],
      },
      include: { absentTeacher: true, replacementTeacher: true },
    });

    return { substitutions };
  }

  async createManual(payload: ManualSubstitutionDto) {
    const { absentTeacherId, replacementTeacherId, day, period, date } = payload;
    const dateValue = new Date(date);

    const clash = await this.prisma.timetable.findFirst({
      where: { teacherId: replacementTeacherId, day, period },
    });
    if (clash) {
      throw new ConflictException('Teacher is not free');
    }

    const alreadyAssigned = await this.prisma.substitution.findFirst({
      where: { replacementTeacherId, day, period, date: dateValue },
    });
    if (alreadyAssigned) {
      throw new ConflictException('Already assigned');
    }

    const substitution = await this.prisma.substitution.create({
      data: {
        absentTeacherId,
        replacementTeacherId,
        day,
        period,
        date: dateValue,
        autoAssigned: false,
      },
    });

    await this.prisma.teacher.update({
      where: { id: replacementTeacherId },
      data: { workload: { increment: 1 } },
    });

    return { substitution };
  }

  async createAuto(payload: BaseSubstitutionDto) {
    const { absentTeacherId, day, period, date } = payload;
    const dateValue = new Date(date);

    const absentSlot = await this.prisma.timetable.findFirst({
      where: { teacherId: absentTeacherId, day, period },
    });

    if (!absentSlot) {
      throw new NotFoundException('Absent slot not found');
    }

    const replacement = await this.findReplacement({
      absentTeacherId,
      day,
      period,
      subject: absentSlot.subject,
      date: dateValue,
    });

    if (!replacement) {
      throw new ConflictException('No available teacher');
    }

    const substitution = await this.prisma.substitution.create({
      data: {
        absentTeacherId,
        replacementTeacherId: replacement.id,
        day,
        period,
        date: dateValue,
        autoAssigned: true,
      },
    });

    await this.prisma.teacher.update({
      where: { id: replacement.id },
      data: { workload: { increment: 1 } },
    });

    return { substitution, replacement };
  }
}
