import { Controller, Put, Body, Param, Get } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Put('users/:id')
  async updateUserAsAdmin(@Param('id') id: string, @Body() updateUserDto: { email?: string; name?: string; password?: string }) {
    return this.usersService.updateUser(Number(id), updateUserDto);
  }

  @ApiOperation({summary: "Obtener admin por ID"})
  @Get('user/:id')
  async getAdminById(@Param('id') id: string) {
      const userId = parseInt(id, 10);
      return this.usersService.findById(userId);
  }

  @ApiOperation({summary: "Endpoint para listar todos los usuarios"})
  @Get('user/list')
  async getUserList() {
      return this.usersService.getAllUsers();
  }
}