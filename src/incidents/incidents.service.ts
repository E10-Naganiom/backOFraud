import { Injectable } from '@nestjs/common';
import { IncidentsRepository, Incident } from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(private readonly incidentsRepo: IncidentsRepository) {}

  async createIncident(data: { titulo: string; id_categoria: number; nombre_atacante?: string; telefono?: string; correo?: string; user?: string; red_social?: string; descripcion: string; id_usuario: number; supervisor?: number; es_anonimo: boolean; }) {
    try{
      return this.incidentsRepo.createIncident(data.titulo, data.id_categoria, data.descripcion, data.id_usuario, data.es_anonimo, data.supervisor?? undefined, data.nombre_atacante?? undefined, data.telefono?? undefined, data.correo?? undefined, data.user?? undefined, data.red_social?? undefined );
    }
    catch(error){
      console.error('Error inesperado en createIncident:', error);
      throw error;
    }
  }

  async findAllIncidents() {
    return this.incidentsRepo.findAllIncidents();
  }

  async findIncidentById(id: number) {
    return this.incidentsRepo.findIncidentById(id);
  }

  async updateIncident(id: number, data: Partial<Incident>) {
    if (!data) {
      throw new Error('Update data is required');
    }
    return this.incidentsRepo.updateIncident(id, data);
  }

  deleteIncident(id: number) {
    return this.incidentsRepo.deleteIncident(id);
  }
}
