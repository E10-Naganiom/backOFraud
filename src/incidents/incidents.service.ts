/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentsRepository, Incident } from './incidents.repository';
import { EvidenceService } from '../evidences/evidence.service';
import { FilesService, UploadedFileInfo } from '../files/file.service';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly incidentsRepo: IncidentsRepository,
    private readonly evidenceService: EvidenceService,
    private readonly filesService: FilesService
  ) {}

  async createIncident(
    data: {
      titulo: string;
      id_categoria: number;
      nombre_atacante?: string;
      telefono?: string;
      correo?: string;
      user_red?: string;
      red_social?: string;
      descripcion: string;
      id_usuario: number;
      supervisor?: number;
      es_anonimo: boolean;
    },
    files?: Express.Multer.File[]
  ) {
    try {
      // 1. Validar archivos si existen
      if (files && files.length > 0) {
        this.filesService.validateMultipleFiles(files, 5);
      }

      // 2. Crear el incidente
      const incident = await this.incidentsRepo.createIncident(
        data.titulo,
        data.id_categoria,
        data.descripcion,
        data.id_usuario,
        data.es_anonimo,
        data.supervisor ?? undefined,
        data.nombre_atacante ?? undefined,
        data.telefono ?? undefined,
        data.correo ?? undefined,
        data.user_red ?? undefined,
        data.red_social ?? undefined
      );

      // 3. Si hay archivos, crear las evidencias
      let evidences: any[] = [];
      if (files && files.length > 0) {
        const filesInfo = this.filesService.getMultipleFilesInfo(files);
        const urls = filesInfo.map(fileInfo => fileInfo.relativePath);
        evidences = await this.evidenceService.createMultipleEvidences(incident.id, urls);
      }

      return {
        ...incident,
        evidencias: evidences
      };
    } catch (error) {
      console.error('Error inesperado en createIncident:', error);
      throw error;
    }
  }

  async findAllIncidents() {
    const incidents = await this.incidentsRepo.findAllIncidents();
    
    // Obtener evidencias para cada incidente
    const incidentsWithEvidences = await Promise.all(
      incidents.map(async (incident) => {
        const evidences = await this.evidenceService.findEvidencesByIncidentId(incident.id);
        return {
          ...incident,
          evidencias: evidences
        };
      })
    );

    return incidentsWithEvidences;
  }

  async findIncidentById(id: number) {
    const incident = await this.incidentsRepo.findIncidentById(id);
    
    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    const evidences = await this.evidenceService.findEvidencesByIncidentId(id);

    return {
      ...incident,
      evidencias: evidences
    };
  }

  async updateIncident(
    id: number,
    data: Partial<Incident>,
    files?: Express.Multer.File[],
    evidenciasAEliminar?: number[]
  ) {
    if (!data && (!files || files.length === 0) && (!evidenciasAEliminar || evidenciasAEliminar.length === 0)) {
      throw new Error('Se requiere al menos un campo para actualizar');
    }

    try {
      // 1. Verificar que el incidente existe
      const incident = await this.incidentsRepo.findIncidentById(id);
      if (!incident) {
        throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
      }

      // 2. Eliminar evidencias si se especificaron
      if (evidenciasAEliminar && evidenciasAEliminar.length > 0) {
        await this.evidenceService.deleteMultipleEvidences(evidenciasAEliminar);
      }

      // 3. Validar y agregar nuevas evidencias si existen
      let newEvidences: any[] = [];
      if (files && files.length > 0) {
        // Validar límite considerando evidencias actuales
        const currentCount = await this.evidenceService.getEvidenceCount(id);
        const deletedCount = evidenciasAEliminar ? evidenciasAEliminar.length : 0;
        const remainingSlots = 5 - (currentCount - deletedCount);

        if (files.length > remainingSlots) {
          throw new Error(
            `Solo puedes agregar ${remainingSlots} evidencia(s) más. ` +
            `El incidente actualmente tiene ${currentCount} evidencia(s) y estás eliminando ${deletedCount}.`
          );
        }

        this.filesService.validateMultipleFiles(files, files.length);
        const filesInfo = this.filesService.getMultipleFilesInfo(files);
        const urls = filesInfo.map(fileInfo => fileInfo.relativePath);
        newEvidences = await this.evidenceService.createMultipleEvidences(id, urls);
      }

      // 4. Actualizar los datos del incidente si se proporcionaron
      if (data && Object.keys(data).length > 0) {
        await this.incidentsRepo.updateIncident(id, data);
      }

      // 5. Retornar el incidente actualizado con todas sus evidencias
      const updatedIncident = await this.incidentsRepo.findIncidentById(id);
      const allEvidences = await this.evidenceService.findEvidencesByIncidentId(id);

      return {
        ...updatedIncident,
        evidencias: allEvidences,
        nuevas_evidencias_agregadas: newEvidences.length
      };
    } catch (error) {
      console.error('Error inesperado en updateIncident:', error);
      throw error;
    }
  }
  async findIncidentsByUserId(userId: number) {
    // Verificar que el usuario tiene incidentes
    const incidents = await this.incidentsRepo.findIncidentsByUserId(userId);
    if (!incidents || incidents.length === 0) {
      throw new NotFoundException(`No se encontraron incidentes para el usuario con ID ${userId}`);
    }
    // Obtener evidencias para cada incidente
    const incidentsWithEvidences = await Promise.all(
      incidents.map(async (incident) => {
        const evidences = await this.evidenceService.findEvidencesByIncidentId(incident.id);
        return {
          ...incident,
          evidencias: evidences
        };
      })
    );
    return incidentsWithEvidences.map(incident => ({
      ...incident,
      es_anonimo: Boolean(incident.es_anonimo)
    }));
  }

  async getIncidentStatus(id: number) {
    return this.incidentsRepo.getIncidentStatus(id);
  }

  async getIncidentUsername(id: number) {
    return this.incidentsRepo.getIncidentUsername(id); 
  }

  async findRecentIncidents() {
    const incidents = await this.incidentsRepo.findRecentIncidents();
    if (!incidents || incidents.length === 0) {
      throw new NotFoundException('No se encontraron incidentes recientes');
    }
    // Obtener evidencias para cada incidente
    const incidentsWithEvidences = await Promise.all(
      incidents.map(async (incident) => {
        const evidences = await this.evidenceService.findEvidencesByIncidentId(incident.id);
        return {
          ...incident,
          evidencias: evidences
        };
      })
    );
    return incidentsWithEvidences.map(incident => ({
      ...incident,
      es_anonimo: Boolean(incident.es_anonimo)
    }));
  }

  async getIncidentStatistics() {
    return this.incidentsRepo.getIncidentStatistics();
  }

}