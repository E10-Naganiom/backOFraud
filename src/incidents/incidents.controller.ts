import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { Incident } from './incidents.repository';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { create } from 'domain';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@ApiTags('Modulo de Incidentes')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @ApiOperation({ summary: 'Crear un nuevo incidente' })
  @ApiResponse({ status: 201, description: 'Incidente creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @Post()
  async createIncident(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.createIncident(createIncidentDto);
  }

  @ApiOperation({ summary: 'Obtener un incidente en base a su ID' })
  @ApiResponse({ status: 200, description: 'Incidente obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @Get(':id')
  async findOneIncident(@Param('id') id: string) {
    return this.incidentsService.findIncidentById(Number(id));
  }

  @ApiOperation({ summary: 'Actualizar incidentes en base a su ID' })
  @ApiResponse({ status: 200, description: 'Incidente actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiBody({ type: UpdateIncidentDto })
  @Put(':id')
  async updateIncident(@Param('id') id: string, @Body() data: Partial<Incident>) {
    return this.incidentsService.updateIncident(Number(id), data);
  }

  @ApiOperation({ summary: 'Eliminar un incidente en base a su ID' })
  @ApiResponse({ status: 200, description: 'Incidente eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @Patch(':id/delete')
  async deleteIncident(@Param('id') id: number) {
    return this.incidentsService.updateIncident(Number(id), { id_estatus: 3 });
  }
}
