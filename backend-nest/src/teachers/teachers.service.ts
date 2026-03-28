import { ConflictException, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { name?: string; subject?: string; className?: string }) {
    const { name, subject, className } = query;
    return this.prisma.teacher.findMany({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
        subjects: subject ? { has: subject } : undefined,
        timetables: className
          ? { some: { className: { contains: className, mode: 'insensitive' } } }
          : undefined,
      },
      include: { timetables: true },
    });
  }

  async create(payload: CreateTeacherDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const teacher = await this.prisma.teacher.create({
      data: {
        name: payload.name,
        subjects: payload.subjects ?? [],
      },
    });

    const password = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password,
        role: 'TEACHER',
        teacherId: teacher.id,
      },
    });

    return { teacher, user };
  }

  async update(id: string, payload: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: payload,
    });

    return { teacher };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({ where: { teacherId: id } });

    await this.prisma.$transaction([
      this.prisma.timetable.deleteMany({ where: { teacherId: id } }),
      this.prisma.specialClass.deleteMany({ where: { teacherId: id } }),
      this.prisma.substitution.deleteMany({
        where: {
          OR: [{ absentTeacherId: id }, { replacementTeacherId: id }],
        },
      }),
      ...(user ? [this.prisma.user.delete({ where: { id: user.id } })] : []),
      this.prisma.teacher.delete({ where: { id } }),
    ]);

    return { success: true };
  }
}
