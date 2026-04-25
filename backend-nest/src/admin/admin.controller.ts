import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import { AdminService } from './admin.service';

@Controller('api/admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending')
  async getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  @Get()
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post(':id/approve')
  async approveUser(@Param('id') userId: string) {
    return this.adminService.approveUser(userId);
  }

  @Post(':id/toggle-create-students')
  async toggleCreateStudents(@Param('id') userId: string) {
    return this.adminService.toggleCreateStudents(userId);
  }

  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }
}
