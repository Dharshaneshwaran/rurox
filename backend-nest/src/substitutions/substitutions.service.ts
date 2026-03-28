import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';
import { BaseSubstitutionDto } from './dto/base-substitution.dto';
import { ManualSubstitutionDto } from './dto/manual-substitution.dto';
import { FullDayAbsenceDto } from './dto/full-day-absence.dto';
import { ConfirmFullDayDto } from './dto/confirm-full-day.dto';

const DAY_MAP: Record<number, 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI'> = {
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
};

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

  private async findAllCandidates(params: {
    absentTeacherId: string;
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
    period: number;
    subject?: string;
    date: Date;
    excludeIds?: Set<string>;
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
        .map((item) => item.replacementTeacherId)
        .filter((id): id is string => Boolean(id))
    );

    // Also exclude teachers already suggested for earlier periods in this batch
    if (params.excludeIds) {
      params.excludeIds.forEach((id) => unavailableIds.add(id));
    }

    const candidates = teachers.filter(
      (teacher) => !unavailableIds.has(teacher.id)
    );

    const scored = candidates
      .map((teacher) => {
        const subjectMatch = params.subject
          ? teacher.subjects.includes(params.subject)
          : false;
        const score = (subjectMatch ? 100 : 0) - teacher.workload;
        return {
          id: teacher.id,
          name: teacher.name,
          subjects: teacher.subjects,
          workload: teacher.workload,
          subjectMatch,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    return scored;
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

  async suggestFullDay(payload: FullDayAbsenceDto) {
    const { absentTeacherId, date } = payload;
    const dateValue = new Date(date);
    const dayOfWeek = dateValue.getUTCDay();
    const day = DAY_MAP[dayOfWeek];

    if (!day) {
      throw new ConflictException('The selected date falls on a weekend');
    }

    // Get the absent teacher's info
    const absentTeacher = await this.prisma.teacher.findUnique({
      where: { id: absentTeacherId },
    });
    if (!absentTeacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get all timetable slots for this teacher on this day
    const slots = await this.prisma.timetable.findMany({
      where: { teacherId: absentTeacherId, day },
      orderBy: { period: 'asc' },
    });

    if (slots.length === 0) {
      return {
        absentTeacher: { id: absentTeacher.id, name: absentTeacher.name },
        day,
        date,
        suggestions: [],
        message: 'This teacher has no classes on the selected day',
      };
    }

    // For each period, find candidates. Track who we've already picked as "best"
    // to avoid double-booking the same substitute across periods.
    const usedIds = new Set<string>();
    const suggestions = [];

    for (const slot of slots) {
      const allCandidates = await this.findAllCandidates({
        absentTeacherId,
        day,
        period: slot.period,
        subject: slot.subject,
        date: dateValue,
        excludeIds: usedIds,
      });

      const suggested = allCandidates.length > 0 ? allCandidates[0] : null;
      if (suggested) {
        usedIds.add(suggested.id);
      }

      suggestions.push({
        period: slot.period,
        subject: slot.subject,
        className: slot.className,
        room: slot.room,
        suggestedTeacher: suggested
          ? { id: suggested.id, name: suggested.name, subjectMatch: suggested.subjectMatch }
          : null,
        allCandidates: allCandidates.map((c) => ({
          id: c.id,
          name: c.name,
          subjects: c.subjects,
          subjectMatch: c.subjectMatch,
          workload: c.workload,
        })),
      });
    }

    return {
      absentTeacher: { id: absentTeacher.id, name: absentTeacher.name },
      day,
      date,
      suggestions,
    };
  }

  async confirmFullDay(payload: ConfirmFullDayDto) {
    const { absentTeacherId, date, assignments } = payload;
    const dateValue = new Date(date);
    const dayOfWeek = dateValue.getUTCDay();
    const day = DAY_MAP[dayOfWeek];

    if (!day) {
      throw new ConflictException('The selected date falls on a weekend');
    }

    const created = [];

    for (const assignment of assignments) {
      // Check for clash
      const clash = await this.prisma.timetable.findFirst({
        where: { teacherId: assignment.replacementTeacherId, day, period: assignment.period },
      });
      if (clash) {
        throw new ConflictException(
          `Teacher is not free for period ${assignment.period}`,
        );
      }

      const alreadyAssigned = await this.prisma.substitution.findFirst({
        where: {
          replacementTeacherId: assignment.replacementTeacherId,
          day,
          period: assignment.period,
          date: dateValue,
        },
      });
      if (alreadyAssigned) {
        throw new ConflictException(
          `Period ${assignment.period} already has a substitution assigned`,
        );
      }

      const substitution = await this.prisma.substitution.create({
        data: {
          absentTeacherId,
          replacementTeacherId: assignment.replacementTeacherId,
          day,
          period: assignment.period,
          date: dateValue,
          autoAssigned: true,
        },
        include: { absentTeacher: true, replacementTeacher: true },
      });

      await this.prisma.teacher.update({
        where: { id: assignment.replacementTeacherId },
        data: { workload: { increment: 1 } },
      });

      created.push(substitution);
    }

    return { substitutions: created, count: created.length };
  }
}
