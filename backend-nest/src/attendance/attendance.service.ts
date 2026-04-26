import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(dto: MarkAttendanceDto, teacherName: string) {
    const date = new Date(dto.date);
    // Normalize to midnight UTC
    date.setUTCHours(0, 0, 0, 0);

    const operations = dto.records.map((record) =>
      this.prisma.attendance.upsert({
        where: {
          studentId_date_subject: {
            studentId: record.studentId,
            date,
            subject: dto.subject ?? 'General',
          },
        },
        update: { status: record.status, markedBy: teacherName },
        create: {
          studentId: record.studentId,
          date,
          status: record.status,
          subject: dto.subject ?? 'General',
          markedBy: teacherName,
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }

  async getStudentAttendanceSummary(studentId: string) {
    const records = await this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { records, total, present, percentage };
  }

  async getMyAttendance(studentId: string) {
    return this.getStudentAttendanceSummary(studentId);
  }

  async getClassAttendance(className: string, dateStr: string) {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const studentsInClass = await this.prisma.student.findMany({
      where: { className },
      select: { id: true, name: true, rollNumber: true },
    });

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        student: { className },
        date: { gte: date, lt: nextDay },
      },
    });

    return { students: studentsInClass, attendance: attendanceRecords, date: dateStr };
  }
}
