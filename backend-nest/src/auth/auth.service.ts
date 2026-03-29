import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';

const jwtSecret = process.env.JWT_SECRET ?? 'change_me';
const brevoApiKey = process.env.BREVO_API_KEY ?? '';
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL ?? '';
const brevoSenderName = process.env.BREVO_SENDER_NAME ?? 'Smart Teacher System';
const adminApprovalEmail = process.env.ADMIN_APPROVAL_EMAIL ?? '';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role === 'TEACHER' && !user.approved) {
      throw new UnauthorizedException('Your account is pending admin approval');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        teacherId: user.teacherId ?? null,
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
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, teacherId: true },
    });

    return { user };
  }

  async signup(name: string, email: string, password: string) {
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
}
