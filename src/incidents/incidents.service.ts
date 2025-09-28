import { Injectable } from '@nestjs/common';
import { IncidentsRepository, Incident } from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(private readonly incidentsRepo: IncidentsRepository) {}

  createIncident(data: Omit<Incident, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>) {
    return this.incidentsRepo.createIncident(data);
  }

  findAll() {
    return this.incidentsRepo.findAll();
  }

  findById(id: number) {
    return this.incidentsRepo.findById(id);
  }

  updateIncident(id: number, data: Partial<Incident>) {
    return this.incidentsRepo.updateIncident(id, data);
  }

  deleteIncident(id: number) {
    return this.incidentsRepo.deleteIncident(id);
  }
}
