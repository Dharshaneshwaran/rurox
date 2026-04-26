import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SchoolClassesService } from './school-classes.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/school-classes')
@UseGuards(AuthGuard, RolesGuard)
export class SchoolClassesController {
  constructor(private readonly schoolClassesService: SchoolClassesService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: { name: string; teacherId?: string }) {
    return this.schoolClassesService.create(body.name, body.teacherId);
  }

  @Get()
  findAll() {
    return this.schoolClassesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolClassesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: { name?: string; teacherId?: string }) {
    return this.schoolClassesService.update(id, body.name, body.teacherId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.schoolClassesService.remove(id);
  }
}
