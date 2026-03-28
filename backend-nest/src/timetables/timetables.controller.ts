import { Body, Controller, ForbiddenException, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { TimetablesService } from './timetables.service';

@Controller('api/timetables')
@UseGuards(AuthGuard, RolesGuard)
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('teacher') teacher?: string,
    @Query('subject') subject?: string,
    @Query('class') className?: string,
    @Query('day') day?: string
  ) {
    return this.timetablesService.findAll({ teacher, subject, className, day });
  }

  @Get('mine')
  async findMine(@Req() req: Request & { user?: AuthUser }) {
    if (!req.user) {
      return { timetables: [] };
    }
    return this.timetablesService.findMine(req.user);
  }

  @Post()
  async create(
    @Body() body: CreateTimetableDto,
    @Req() req: Request & { user?: AuthUser }
  ) {
    // Teachers can only add subjects to their own timetable
    if (req.user?.role === 'TEACHER' && req.user.teacherId !== body.teacherId) {
      throw new ForbiddenException('Teachers can only manage their own timetable');
    }
    return this.timetablesService.create(body);
  }
}
