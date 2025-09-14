import { Controller, Put, Body, Param, Get, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserAsAdminDto } from './dto/update-user-admin.dto';

@ApiTags('Modulo de Administración')
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({summary: "Endpoint para listar todos los usuarios"})
  @ApiResponse({status: 200, description: 'Lista de usuarios obtenida exitosamente'})
  @ApiResponse({status: 403, description: 'Acceso denegado'})
  @Get('user/list')
  async getUserList() {
      return this.usersService.getAllUsers();
  }

  @ApiOperation({summary: "Endpoint para actualizar un usuario como admin"})
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario a actualizar' })
  @ApiBody({ type: UpdateUserAsAdminDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Put('user/:id')
  async updateUserAsAdmin(@Param('id') id: string, @Body() updateUserDto: UpdateUserAsAdminDto) {
    console.log('Admin PUT - ID:', id);
    console.log('Admin PUT - Body:', updateUserDto);
    const updated = await this.usersService.updateUser(Number(id), updateUserDto);
    if (!updated) {
      throw new NotFoundException('No se encontró el usuario con un ID: ' + id);
    }
    return updated;
  }

  @ApiOperation({summary: "Endpoint para obtener un usuario por ID como admin"})
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario a obtener' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get('user/:id')
  async getAdminById(@Param('id') id: string) {
      const userId = parseInt(id, 10);
      const user = await this.usersService.findById(userId);
      if (!user) throw new NotFoundException('No se encontró el usuario con un ID: ' + id);
      return user;
  }
}