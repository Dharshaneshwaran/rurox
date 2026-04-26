import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolClassesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, teacherId?: string) {
    const existing = await this.prisma.schoolClass.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Class already exists');

    return this.prisma.schoolClass.create({
      data: { name, teacherId },
      include: { classTeacher: true, _count: { select: { students: true } } }
    });
  }

  async findAll() {
    return this.prisma.schoolClass.findMany({
      include: { 
        classTeacher: true, 
        _count: { select: { students: true } } 
      }
    });
  }

  async findOne(id: string) {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id },
      include: { 
        classTeacher: true, 
        students: true,
        timetables: { include: { teacher: true } }
      }
    });
    if (!schoolClass) throw new NotFoundException('Class not found');
    return schoolClass;
  }

  async update(id: string, name?: string, teacherId?: string) {
    return this.prisma.schoolClass.update({
      where: { id },
      data: { name, teacherId },
      include: { classTeacher: true }
    });
  }

  async remove(id: string) {
    return this.prisma.schoolClass.delete({ where: { id } });
  }
}
