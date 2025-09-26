import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) {}

    @Post()
    async create(@Body(ValidationPipe) createIncidentDto: CreateIncidentDto) {
        return this.incidentsService.createIncident(createIncidentDto);
    }

    @Get()
    async findAll() {
        return this.incidentsService.findAll();
    }

    @Get('approved')
    async findApproved() {
        return this.incidentsService.findApproved();
    }

    @Get('category/:id_categoria')
    async findByCategory(@Param('id_categoria') id_categoria: string) {
        return this.incidentsService.findByCategory(+id_categoria);
    }

    @Get('user/:id_usuario')
    @UseGuards(JwtAuthGuard)
    async findByUser(@Param('id_usuario') id_usuario: string) {
        return this.incidentsService.findByUser(+id_usuario);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.incidentsService.findById(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body(ValidationPipe) updateIncidentDto: UpdateIncidentDto) {
        return this.incidentsService.updateIncident(+id, updateIncidentDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.incidentsService.deleteIncident(+id);
    }
}