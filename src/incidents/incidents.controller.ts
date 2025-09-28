import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { Incident } from './incidents.repository';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() data: Omit<Incident, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>) {
    return this.incidentsService.createIncident(data);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findById(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Incident>) {
    return this.incidentsService.updateIncident(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.deleteIncident(Number(id));
  }
}
