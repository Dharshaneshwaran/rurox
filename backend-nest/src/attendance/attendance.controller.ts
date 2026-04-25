import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/attendance')
@UseGuards(AuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Teacher: Mark attendance for a class
  @Post()
  @Roles('TEACHER')
  async markAttendance(@Body() dto: MarkAttendanceDto, @Request() req: any) {
    const teacherName = req.user.email;
    return this.attendanceService.markAttendance(dto, teacherName);
  }

  // Student: Get my attendance history + percentage
  @Get('my')
  @Roles('STUDENT')
  async getMyAttendance(@Request() req: any) {
    return this.attendanceService.getMyAttendance(req.user.studentId);
  }

  // Teacher: Get class attendance for a specific date
  @Get('class')
  @Roles('TEACHER', 'ADMIN')
  async getClassAttendance(
    @Query('className') className: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getClassAttendance(className, date);
  }
}
