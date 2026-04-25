import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { AssignStudentToTeacherDto } from './dto/assign-student-to-teacher.dto';
import { AssignTimetableDto } from './dto/assign-timetable.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/students')
@UseGuards(AuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    try {
      const student = await this.studentsService.createStudent(
        createStudentDto,
      );
      return { success: true, student };
    } catch (error) {
      throw new BadRequestException('Failed to create student');
    }
  }

  @Get()
  async getAllStudents() {
    try {
      const students = await this.studentsService.getAllStudents();
      return { success: true, students };
    } catch (error) {
      throw new BadRequestException('Failed to fetch students');
    }
  }

  @Get('class/:className')
  async getStudentsByClass(@Param('className') className: string) {
    try {
      const students = await this.studentsService.getStudentsByClass(className);
      return { success: true, students };
    } catch (error) {
      throw new BadRequestException('Failed to fetch students by class');
    }
  }

  @Get(':id')
  async getStudent(@Param('id') id: string) {
    try {
      const student = await this.studentsService.getStudentById(id);
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      return { success: true, student };
    } catch (error) {
      throw new BadRequestException('Failed to fetch student');
    }
  }

  @Post(':id/assign-teacher')
  async assignTeacher(
    @Param('id') studentId: string,
    @Body() assignDto: AssignStudentToTeacherDto,
  ) {
    try {
      const student = await this.studentsService.assignStudentToTeacher(
        studentId,
        assignDto,
      );
      return { success: true, student };
    } catch (error) {
      throw new BadRequestException('Failed to assign teacher to student');
    }
  }

  @Post(':id/remove-teacher/:teacherId')
  async removeTeacher(
    @Param('id') studentId: string,
    @Param('teacherId') teacherId: string,
  ) {
    try {
      const student = await this.studentsService.removeStudentFromTeacher(
        studentId,
        teacherId,
      );
      return { success: true, student };
    } catch (error) {
      throw new BadRequestException('Failed to remove teacher from student');
    }
  }

  @Post(':id/timetable')
  async assignTimetable(
    @Param('id') studentId: string,
    @Body() assignTimetableDto: AssignTimetableDto,
  ) {
    try {
      const timetable =
        await this.studentsService.assignStudentTimetable(
          studentId,
          assignTimetableDto,
        );
      return { success: true, timetable };
    } catch (error) {
      throw new BadRequestException('Failed to assign timetable to student');
    }
  }

  @Get(':id/timetable')
  async getStudentTimetable(@Param('id') studentId: string) {
    try {
      const timetable =
        await this.studentsService.getStudentTimetable(studentId);
      return { success: true, timetable };
    } catch (error) {
      throw new BadRequestException('Failed to fetch student timetable');
    }
  }
}
