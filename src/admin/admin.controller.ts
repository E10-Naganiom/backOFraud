import { Controller, Put, Body, Param, Get, NotFoundException, Patch } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { IncidentsService } from '../incidents/incidents.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserAsAdminDto } from './dto/update-user-admin.dto';

@ApiTags('Modulo de Administración')
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService, private readonly incidentsService: IncidentsService) {}

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

  @ApiOperation({ summary: 'Obtener todos los incidentes' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes obtenida exitosamente.' })
  @ApiResponse({ status: 500, description: 'Error del servidor.' })
  @Get('incidents/list')
  async findAll() {
    return this.incidentsService.findAllIncidents();
  }

  @ApiOperation({ summary: 'Obtener un incidente en base a su ID' })
  @ApiResponse({ status: 200, description: 'Incidente obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @Get('incidents/:id')
  async findOneIncident(@Param('id') id: string) {
    return this.incidentsService.findIncidentById(Number(id));
  }

  @ApiOperation({ summary: 'Obtener los incidentes aprobados' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes aprobados obtenida exitosamente.' })
  @ApiResponse({ status: 500, description: 'Error del servidor.' })
  @Get('incidents/list/approved')
  async findApprovedIncidents() {
    return this.incidentsService.findAllIncidents().then(incidents => incidents.filter(incident => incident.id_estatus === 2));
  }

  @ApiOperation({ summary: 'Obtener los incidentes pendientes' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes pendientes obtenida exitosamente.' })
  @ApiResponse({ status: 500, description: 'Error del servidor.' })
  @Get('incidents/list/pending')
  async findPendingIncidents() {
    return this.incidentsService.findAllIncidents().then(incidents => incidents.filter(incident => incident.id_estatus === 1));
  }

  @ApiOperation({ summary: 'Obtener los incidentes rechazados' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes rechazados obtenida exitosamente.' })
  @ApiResponse({ status: 500, description: 'Error del servidor.' })
  @Get('incidents/list/rejected')
  async findRejectedIncidents() {
    return this.incidentsService.findAllIncidents().then(incidents => incidents.filter(incident => incident.id_estatus === 3));
  }

  @ApiOperation({ summary: 'Evaluar incidentes' })
  @ApiResponse({ status: 200, description: 'Incidente evaluado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiBody({ schema: { type: 'object', properties: { id_estatus: { type: 'number', example: 2 }, supervisor: { type: 'number', example: 1 } } } })
  @Patch('incidents/:id/evaluate')
  async evaluateIncident(@Param('id') id: string, @Body() body: { id_estatus: number; supervisor?: number }) {
    const incident = await this.incidentsService.findIncidentById(Number(id));
    if (!incident) {
      throw new NotFoundException('No se encontró el incidente con un ID: ' + id);
    }
    return this.incidentsService.updateIncident(Number(id), { id_estatus: body.id_estatus, supervisor: body.supervisor ?? incident.supervisor });
  }

  @ApiOperation({ summary: 'Inactivar un usuario por su ID' })
  @ApiResponse({ status: 200, description: 'Usuario inactivado exitosamente' })
  @ApiResponse({ status: 403, description: 'Usuario no encontrado' })
  @Patch('user/:id/inactivate')
  async inactivateUser(@Param('id') id: number) {
      return this.usersService.inactivateUser(Number(id));
  }

}