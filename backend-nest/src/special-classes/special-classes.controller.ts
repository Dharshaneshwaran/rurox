import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import { CreateSpecialClassDto } from './dto/create-special-class.dto';
import { SpecialClassesService } from './special-classes.service';

@Controller('api/special-classes')
@UseGuards(AuthGuard, RolesGuard)
export class SpecialClassesController {
  constructor(private readonly specialClassesService: SpecialClassesService) {}

  @Get()
  async findAll(
    @Req() req: Request & { user?: AuthUser },
    @Query('teacherId') teacherId?: string
  ) {
    if (!req.user) {
      return { specialClasses: [] };
    }
    return this.specialClassesService.findAll(req.user, teacherId);
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() body: CreateSpecialClassDto) {
    return this.specialClassesService.create(body);
  }
}
