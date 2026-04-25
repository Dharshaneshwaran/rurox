import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingUsers() {
    const users = await this.prisma.user.findMany({
      where: { role: 'TEACHER', approved: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
        canCreateStudents: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { users };
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
        canCreateStudents: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { users };
  }

  async approveUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create teacher record if it doesn't exist
    let teacher = await this.prisma.teacher.findFirst({
      where: { user: { id: userId } },
    });

    if (!teacher) {
      teacher = await this.prisma.teacher.create({
        data: {
          name: user.name || 'Unknown',
          user: {
            connect: { id: userId },
          },
        },
      });
    }

    // Approve the user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { approved: true, teacherId: teacher.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
      },
    });

    await this.sendTeacherApprovedEmail({
      name: updatedUser.name ?? 'Teacher',
      email: updatedUser.email,
    });

    return {
      message: 'User approved successfully',
      user: updatedUser,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete associated timetables, substitutions, special classes first
    if (user.teacherId) {
      await this.prisma.timetable.deleteMany({
        where: { teacherId: user.teacherId },
      });
      await this.prisma.substitution.deleteMany({
        where: { OR: [{ absentTeacherId: user.teacherId }, { replacementTeacherId: user.teacherId }] },
      });
      await this.prisma.specialClass.deleteMany({
        where: { teacherId: user.teacherId },
      });
      await this.prisma.teacher.delete({
        where: { id: user.teacherId },
      });
    }

    // Delete the user
    await this.prisma.user.delete({ where: { id: userId } });

    return {
      message: 'User deleted successfully',
    };
  }

  async toggleCreateStudents(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { canCreateStudents: !user.canCreateStudents },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
        canCreateStudents: true,
      },
    });

    return {
      message: 'Create student permission updated successfully',
      user: updatedUser,
    };
  }

  private async sendTeacherApprovedEmail(payload: {
    name: string;
    email: string;
  }) {
    const brevoApiKey = process.env.BREVO_API_KEY ?? '';
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL ?? '';
    const brevoSenderName = process.env.BREVO_SENDER_NAME ?? 'Smart Teacher System';
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    if (!brevoApiKey || !brevoSenderEmail) {
      throw new BadRequestException(
        'Email service not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.'
      );
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: brevoSenderName,
          email: brevoSenderEmail,
        },
        to: [
          {
            email: payload.email,
            name: payload.name,
          },
        ],
        subject: 'Your account has been approved',
        htmlContent: `
          <p>Hello ${payload.name},</p>
          <p>Your account has been approved. You can now log in.</p>
          <p>Login: <a href="${frontendUrl}/teacher/login">${frontendUrl}/teacher/login</a></p>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new BadRequestException(
        `Failed to send approval email: ${response.status} ${errorBody}`
      );
    }
  }
}
