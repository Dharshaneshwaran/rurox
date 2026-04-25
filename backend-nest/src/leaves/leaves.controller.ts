import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/leaves')
@UseGuards(AuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @Roles('STUDENT')
  async createLeave(@Body() dto: CreateLeaveDto, @Request() req: any) {
    // Assuming student profile is linked to user.id or we have studentId in token
    // Let's check how student accounts are created.
    // In previous tasks, we created a Student record and linked it to User.studentId.
    return this.leavesService.createLeave(req.user.studentId, dto);
  }

  @Get('my')
  @Roles('STUDENT')
  async getMyLeaves(@Request() req: any) {
    return this.leavesService.getMyLeaves(req.user.studentId);
  }

  @Get('teacher')
  @Roles('TEACHER')
  async getLeavesForTeacher(@Request() req: any) {
    return this.leavesService.getLeavesForTeacher(req.user.teacherId);
  }

  @Put(':id/status')
  @Roles('TEACHER')
  async updateLeaveStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.leavesService.updateLeaveStatus(id, status);
  }
}
