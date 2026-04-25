import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeave(studentId: string, dto: CreateLeaveDto) {
    return this.prisma.leaveRequest.create({
      data: {
        studentId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        status: 'PENDING',
      },
    });
  }

  async getMyLeaves(studentId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeavesForTeacher(teacherId: string) {
    // Fetch students assigned to this teacher
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { students: { select: { id: true } } },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const studentIds = teacher.students.map((s) => s.id);

    return this.prisma.leaveRequest.findMany({
      where: {
        studentId: { in: studentIds },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            className: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLeaveStatus(leaveId: string, status: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status },
    });
  }
}
