import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitMarksDto } from './dto/submit-marks.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/exams')
@UseGuards(AuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // Teacher/Admin: Create an exam
  @Post()
  @Roles('TEACHER', 'ADMIN')
  async createExam(@Body() dto: CreateExamDto) {
    return this.examsService.createExam(dto);
  }

  // Teacher/Admin: List all exams
  @Get()
  @Roles('TEACHER', 'ADMIN')
  async getAllExams(@Query('className') className?: string) {
    if (className) return this.examsService.getExamsByClass(className);
    return this.examsService.getAllExams();
  }

  // Student: Get my report card results
  @Get('my-results')
  @Roles('STUDENT')
  async getMyResults(@Request() req: any) {
    return this.examsService.getResultsByStudent(req.user.studentId);
  }

  // Teacher: Get students + submitted marks for an exam
  @Get(':id/enter-marks')
  @Roles('TEACHER', 'ADMIN')
  async getStudentsForExam(@Param('id') id: string) {
    return this.examsService.getStudentsWithoutResults(id);
  }

  // Teacher: Get all results for an exam
  @Get(':id/results')
  @Roles('TEACHER', 'ADMIN')
  async getExamResults(@Param('id') id: string) {
    return this.examsService.getResultsByExam(id);
  }

  // Teacher: Submit marks for an exam
  @Post(':id/results')
  @Roles('TEACHER', 'ADMIN')
  async submitMarks(@Param('id') id: string, @Body() dto: SubmitMarksDto) {
    return this.examsService.submitMarks(id, dto);
  }

  // Admin: Delete an exam
  @Delete(':id')
  @Roles('ADMIN')
  async deleteExam(@Param('id') id: string) {
    return this.examsService.deleteExam(id);
  }
}
