import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IncidentsRepository } from './incidents.repository';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Injectable()
export class IncidentsService {
    constructor(private readonly incidentsRepository: IncidentsRepository) {}

    async createIncident(createIncidentDto: CreateIncidentDto) {
        try {
            const data = {
                ...createIncidentDto,
                fecha_incidente: createIncidentDto.fecha_incidente ? new Date(createIncidentDto.fecha_incidente) : undefined
            };
            return await this.incidentsRepository.createIncident(data);
        } catch (error) {
            console.error('Error creating incident:', error);
            throw new InternalServerErrorException('Ocurrió un error al crear el incidente.');
        }
    }

    async findAll() {
        try {
            return await this.incidentsRepository.findAll();
        } catch (error) {
            console.error('Error fetching incidents:', error);
            throw new InternalServerErrorException('Ocurrió un error al obtener los incidentes.');
        }
    }

    async findById(id: number) {
        try {
            const incident = await this.incidentsRepository.findById(id);
            if (!incident) {
                throw new NotFoundException('Incidente no encontrado.');
            }
            return incident;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error fetching incident:', error);
            throw new InternalServerErrorException('Ocurrió un error al obtener el incidente.');
        }
    }

    async findByCategory(id_categoria: number) {
        try {
            return await this.incidentsRepository.findByCategory(id_categoria);
        } catch (error) {
            console.error('Error fetching incidents by category:', error);
            throw new InternalServerErrorException('Ocurrió un error al obtener los incidentes por categoría.');
        }
    }

    async findByUser(id_usuario: number) {
        try {
            return await this.incidentsRepository.findByUser(id_usuario);
        } catch (error) {
            console.error('Error fetching incidents by user:', error);
            throw new InternalServerErrorException('Ocurrió un error al obtener los incidentes del usuario.');
        }
    }

    async findApproved() {
        try {
            return await this.incidentsRepository.findApproved();
        } catch (error) {
            console.error('Error fetching approved incidents:', error);
            throw new InternalServerErrorException('Ocurrió un error al obtener los incidentes aprobados.');
        }
    }

    async updateIncident(id: number, updateIncidentDto: UpdateIncidentDto) {
        try {
            const incident = await this.incidentsRepository.findById(id);
            if (!incident) {
                throw new NotFoundException('Incidente no encontrado.');
            }

            const data = {
                ...updateIncidentDto,
                fecha_incidente: updateIncidentDto.fecha_incidente ? new Date(updateIncidentDto.fecha_incidente) : undefined
            };

            return await this.incidentsRepository.updateIncident(id, data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating incident:', error);
            throw new InternalServerErrorException('Ocurrió un error al actualizar el incidente.');
        }
    }

    async deleteIncident(id: number) {
        try {
            const incident = await this.incidentsRepository.findById(id);
            if (!incident) {
                throw new NotFoundException('Incidente no encontrado.');
            }

            const deleted = await this.incidentsRepository.deleteIncident(id);
            if (!deleted) {
                throw new InternalServerErrorException('No se pudo eliminar el incidente.');
            }

            return { message: 'Incidente eliminado exitosamente.' };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
                throw error;
            }
            console.error('Error deleting incident:', error);
            throw new InternalServerErrorException('Ocurrió un error al eliminar el incidente.');
        }
    }
}