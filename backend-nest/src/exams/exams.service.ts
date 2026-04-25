import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitMarksDto } from './dto/submit-marks.dto';

function calculateGrade(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
}

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async createExam(dto: CreateExamDto) {
    return this.prisma.exam.create({
      data: {
        name: dto.name,
        className: dto.className,
        subject: dto.subject,
        maxMarks: dto.maxMarks,
        examDate: new Date(dto.examDate),
      },
    });
  }

  async getAllExams() {
    return this.prisma.exam.findMany({
      orderBy: { examDate: 'desc' },
      include: { _count: { select: { results: true } } },
    });
  }

  async getExamsByClass(className: string) {
    return this.prisma.exam.findMany({
      where: { className },
      orderBy: { examDate: 'desc' },
    });
  }

  async submitMarks(examId: string, dto: SubmitMarksDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');

    const operations = dto.results.map((entry) =>
      this.prisma.examResult.upsert({
        where: { examId_studentId: { examId, studentId: entry.studentId } },
        update: {
          marksObtained: entry.marksObtained,
          grade: calculateGrade(entry.marksObtained, exam.maxMarks),
        },
        create: {
          examId,
          studentId: entry.studentId,
          marksObtained: entry.marksObtained,
          grade: calculateGrade(entry.marksObtained, exam.maxMarks),
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }

  async getResultsByStudent(studentId: string) {
    return this.prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getResultsByExam(examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');

    const results = await this.prisma.examResult.findMany({
      where: { examId },
      include: {
        student: { select: { id: true, name: true, rollNumber: true, className: true } },
      },
      orderBy: [{ grade: 'asc' }, { student: { name: 'asc' } }],
    });

    return { exam, results };
  }

  async getStudentsWithoutResults(examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');

    const studentsInClass = await this.prisma.student.findMany({
      where: { className: exam.className },
      select: { id: true, name: true, rollNumber: true },
    });

    const existingResults = await this.prisma.examResult.findMany({
      where: { examId },
      select: { studentId: true },
    });

    const submittedIds = new Set(existingResults.map((r) => r.studentId));
    return { exam, students: studentsInClass, submittedIds: Array.from(submittedIds) };
  }

  async deleteExam(examId: string) {
    return this.prisma.exam.delete({ where: { id: examId } });
  }
}
