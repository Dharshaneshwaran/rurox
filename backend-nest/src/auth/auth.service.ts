import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const jwtSecret = process.env.JWT_SECRET ?? 'change_me';
const brevoApiKey = process.env.BREVO_API_KEY ?? '';
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL ?? '';
const brevoSenderName = process.env.BREVO_SENDER_NAME ?? 'Smart Teacher System';
const adminApprovalEmail = process.env.ADMIN_APPROVAL_EMAIL ?? '';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  async login(emailStr: string, passwordStr: string) {
    const email = emailStr.toLowerCase().trim();
    const password = passwordStr.trim();

    console.log(`[AuthService] Attempting login for email: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`[AuthService] User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    console.log(`[AuthService] User found. ID: ${user.id}, Role: ${user.role}, Approved: ${user.approved}`);
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log(`[AuthService] Password mismatch for user: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role === 'TEACHER' && !user.approved) {
      console.log(`[AuthService] Teacher login blocked: Pending approval for ${email}`);
      throw new UnauthorizedException('Your account is pending admin approval');
    }

    let studentData = null;
    if (user.role === 'STUDENT' && user.studentId) {
      studentData = await this.prisma.student.findUnique({
        where: { id: user.studentId },
        select: { className: true, schoolClassId: true },
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        teacherId: user.teacherId ?? null,
        studentId: user.studentId ?? null,
        canCreateStudents: user.canCreateStudents,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teacherId: user.teacherId ?? null,
        studentId: user.studentId ?? null,
        canCreateStudents: user.canCreateStudents,
        className: studentData?.className ?? null,
        schoolClassId: studentData?.schoolClassId ?? null,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        teacherId: true, 
        studentId: true, 
        canCreateStudents: true,
        student: {
          select: { className: true, schoolClassId: true }
        }
      },
    });

    if (!user) return { user: null };

    return { 
      user: {
        ...user,
        className: user.student?.className ?? null,
        schoolClassId: user.student?.schoolClassId ?? null,
        student: undefined
      } 
    };
  }

  async signup(name: string, emailStr: string, passwordStr: string) {
    const email = emailStr.toLowerCase().trim();
    const password = passwordStr.trim();

    try {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (unapproved by default)
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'TEACHER',
          approved: false,
        },
      });

      await this.sendAdminApprovalEmail({
        name: user.name ?? 'New Teacher',
        email: user.email,
        createdAt: user.createdAt,
      });
      await this.sendTeacherPendingEmail({
        name: user.name ?? 'Teacher',
        email: user.email,
      });

      return {
        message: 'Signup successful! Please wait for admin approval.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          approved: user.approved,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string') {
        const prismaError = error as { code: string };
        if (prismaError.code === 'P2002') {
          throw new ConflictException('Email already registered');
        }
        if (prismaError.code === 'P2022') {
          throw new BadRequestException(
            'Database schema out of date. Run `npm run prisma:push`.'
          );
        }
      }
      throw new BadRequestException('Signup failed');
    }
  }

  async updateProfile(userId: string, name?: string, emailStr?: string) {
    const data: any = {};
    if (name) data.name = name;
    if (emailStr) data.email = emailStr.toLowerCase().trim();

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { teacher: true, student: true },
    });

    // Sync names if linked
    if (name) {
      if (user.teacherId) {
        await this.prisma.teacher.update({
          where: { id: user.teacherId },
          data: { name },
        });
      }
      if (user.studentId) {
        await this.prisma.student.update({
          where: { id: user.studentId },
          data: { name },
        });
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async updatePassword(userId: string, passwordStr: string) {
    const hashedPassword = await bcrypt.hash(passwordStr.trim(), 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(emailStr: string) {
    const email = emailStr.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        message:
          'If an account exists for that email, a password reset link has been sent.',
      };
    }

    const token = this.createPasswordResetToken(user.id, user.password);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/recover?token=${encodeURIComponent(token)}`;

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.name ?? user.email,
      resetUrl
    );

    return {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };
  }

  async validatePasswordResetToken(token?: string) {
    await this.resolvePasswordResetToken(token);
    return { valid: true };
  }

  async resetPassword(token: string, passwordStr: string) {
    const password = passwordStr.trim();
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.resolvePasswordResetToken(token);
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }

  private async sendAdminApprovalEmail(payload: {
    name: string;
    email: string;
    createdAt: Date;
  }) {
    if (!brevoApiKey || !brevoSenderEmail || !adminApprovalEmail) {
      throw new BadRequestException(
        'Email service not configured. Set BREVO_API_KEY, BREVO_SENDER_EMAIL, and ADMIN_APPROVAL_EMAIL.'
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
            email: adminApprovalEmail,
            name: 'Admin',
          },
        ],
        subject: 'New teacher signup pending approval',
        htmlContent: `
          <p>A new teacher has requested access.</p>
          <p><strong>Name:</strong> ${payload.name}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          <p><strong>Requested At:</strong> ${payload.createdAt.toISOString()}</p>
          <p>Please review in the admin panel.</p>
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

  private async sendTeacherPendingEmail(payload: {
    name: string;
    email: string;
  }) {
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
        subject: 'Your account is pending approval',
        htmlContent: `
          <p>Hello ${payload.name},</p>
          <p>Thanks for signing up. Your account is pending admin approval.</p>
          <p>You will receive another email once your account is approved.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new BadRequestException(
        `Failed to send pending email: ${response.status} ${errorBody}`
      );
    }
  }

  private createPasswordResetToken(userId: string, passwordHash: string) {
    return jwt.sign(
      { sub: userId, purpose: 'password-reset' },
      this.getPasswordResetSecret(passwordHash),
      { expiresIn: '1h' }
    );
  }

  private async resolvePasswordResetToken(token?: string) {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }

    const decoded = jwt.decode(token);
    const userId =
      decoded && typeof decoded === 'object' && typeof decoded.sub === 'string'
        ? decoded.sub
        : null;

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    try {
      const verified = jwt.verify(
        token,
        this.getPasswordResetSecret(user.password)
      ) as { purpose?: string };

      if (verified.purpose !== 'password-reset') {
        throw new BadRequestException('Invalid or expired reset token');
      }
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return user;
  }

  private getPasswordResetSecret(passwordHash: string) {
    return `${jwtSecret}:${passwordHash}`;
  }
}
