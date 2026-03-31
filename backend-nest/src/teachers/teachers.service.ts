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
    const teachers = await this.prisma.teacher.findMany({
      where: {
        name: name ? { contains: name } : undefined,
        subjects: subject ? { contains: subject } : undefined,
        timetables: className
          ? { some: { className: { contains: className } } }
          : undefined,
      },
      include: { timetables: true },
    });

    return teachers.map((teacher) => ({
      ...teacher,
      subjects: teacher.subjects ? teacher.subjects.split(', ') : [],
    }));
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
        subjects: payload.subjects?.join(', ') ?? '',
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

    return {
      teacher: {
        ...teacher,
        subjects: teacher.subjects ? teacher.subjects.split(', ') : [],
      },
      user,
    };
  }

  async update(id: string, payload: UpdateTeacherDto) {
    const { subjects, ...rest } = payload;
    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: {
        ...rest,
        subjects: subjects?.join(', '),
      },
    });

    return {
      teacher: {
        ...teacher,
        subjects: teacher.subjects ? teacher.subjects.split(', ') : [],
      },
    };
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
