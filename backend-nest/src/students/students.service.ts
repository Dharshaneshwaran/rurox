import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { AssignStudentToTeacherDto } from './dto/assign-student-to-teacher.dto';
import { AssignTimetableDto } from './dto/assign-timetable.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createStudent(
    createStudentDto: CreateStudentDto,
    teacherId?: string,
  ) {
    const data: Prisma.StudentCreateInput = {
      name: createStudentDto.name,
      rollNumber: createStudentDto.rollNumber,
      className: createStudentDto.className,
    };

    if (teacherId) {
      data.teachers = {
        connect: {
          id: teacherId,
        },
      };
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Student
      const student = await tx.student.create({
        data,
        include: {
          teachers: true,
        },
      });

      // 2. If email and password are provided, create the User record
      if (createStudentDto.email && createStudentDto.password) {
        const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
        await tx.user.create({
          data: {
            name: createStudentDto.name,
            email: createStudentDto.email,
            password: hashedPassword,
            role: 'STUDENT',
            studentId: student.id,
          },
        });

        // 3. Send welcome email (we don't await it to block the response, but we can)
        this.mailService.sendStudentWelcomeEmail(
          createStudentDto.email,
          createStudentDto.name,
          createStudentDto.password,
        );
      }

      // 4. Auto-sync timetable based on class
      if (student.className) {
        await this.syncStudentTimetable(tx, student.id, student.className);
      }

      return student;
    });
  }

  private async syncStudentTimetable(
    tx: Prisma.TransactionClient,
    studentId: string,
    className: string,
  ) {
    const classTimetable = await tx.timetable.findMany({
      where: { className },
      include: { teacher: true },
    });

    for (const entry of classTimetable) {
      await tx.studentTimetable.upsert({
        where: {
          studentId_day_period: {
            studentId,
            day: entry.day,
            period: entry.period,
          },
        },
        update: {
          subject: entry.subject,
          className: entry.className || className,
          teacher: entry.teacher.name,
          room: entry.room,
        },
        create: {
          studentId,
          day: entry.day,
          period: entry.period,
          subject: entry.subject,
          className: entry.className || className,
          teacher: entry.teacher.name,
          room: entry.room,
        },
      });
    }
  }

  async getAllStudents() {
    return this.prisma.student.findMany({
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
        studentTimetables: true,
      },
    });
  }

  async getStudentById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
        studentTimetables: true,
      },
    });
  }

  async getStudentsByTeacher(teacherId: string) {
    return this.prisma.student.findMany({
      where: {
        teachers: {
          some: {
            id: teacherId,
          },
        },
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
        studentTimetables: true,
      },
    });
  }

  async getStudentsByClass(className: string) {
    return this.prisma.student.findMany({
      where: { className },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
        studentTimetables: true,
      },
    });
  }

  async assignStudentToTeacher(
    studentId: string,
    assignDto: AssignStudentToTeacherDto,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: assignDto.teacherId || '' },
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        teachers: {
          connect: {
            id: teacher.id,
          },
        },
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeStudentFromTeacher(studentId: string, teacherId: string) {
    return this.prisma.student.update({
      where: { id: studentId },
      data: {
        teachers: {
          disconnect: {
            id: teacherId,
          },
        },
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async assignStudentTimetable(
    studentId: string,
    assignTimetableDto: AssignTimetableDto,
  ) {
    return this.prisma.studentTimetable.upsert({
      where: {
        studentId_day_period: {
          studentId,
          day: assignTimetableDto.day as any,
          period: assignTimetableDto.period,
        },
      },
      update: {
        subject: assignTimetableDto.subject,
        className: assignTimetableDto.className,
        teacher: assignTimetableDto.teacher || null,
        room: assignTimetableDto.room || null,
      },
      create: {
        studentId,
        day: assignTimetableDto.day as any,
        period: assignTimetableDto.period,
        subject: assignTimetableDto.subject,
        className: assignTimetableDto.className,
        teacher: assignTimetableDto.teacher || null,
        room: assignTimetableDto.room || null,
      },
    });
  }

  async getStudentTimetable(studentId: string) {
    return this.prisma.studentTimetable.findMany({
      where: { studentId },
    });
  }

  async updateStudent(studentId: string, name: string, className: string) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: studentId },
        data: { name, className },
      });
      await this.syncStudentTimetable(tx, studentId, className);
      return student;
    });
  }

  async deleteStudent(studentId: string) {
    return this.prisma.student.delete({
      where: { id: studentId },
    });
  }
}
