import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller('api/teachers')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('subject') subject?: string,
    @Query('class') className?: string
  ) {
    const teachers = await this.teachersService.findAll({ name, subject, className });
    return { teachers };
  }

  @Post()
  async create(@Body() body: CreateTeacherDto) {
    return this.teachersService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTeacherDto) {
    return this.teachersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
