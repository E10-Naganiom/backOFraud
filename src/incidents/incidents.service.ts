/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  /**
   * Crear un nuevo incidente
   * @param userId - ID del usuario autenticado (del token JWT)
   * @param data - Datos del incidente
   * @param files - Archivos de evidencia (opcional)
   */
  async createIncident(
    userId: number, // ← NUEVO: ID del usuario autenticado
    data: {
      titulo: string;
      id_categoria: number;
      nombre_atacante?: string;
      telefono?: string;
      correo?: string;
      user_red?: string;
      red_social?: string;
      descripcion: string;
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

      // 2. Crear el incidente con el userId del token (más seguro)
      const incident = await this.incidentsRepo.createIncident(
        data.titulo,
        data.id_categoria,
        data.descripcion,
        userId, // ← Usar el ID del usuario autenticado
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

  /**
   * Obtener todos los incidentes con sus evidencias
   * (Sin filtro de usuario - retorna todos)
   */
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

  /**
   * Obtener un incidente por ID con validación de permisos
   * @param id - ID del incidente
   * @param userId - ID del usuario autenticado
   */
  async findIncidentById(id: number, userId: number) {
    const incident = await this.incidentsRepo.findIncidentById(id);
    
    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    // ✅ VALIDACIÓN: Solo el dueño puede ver su incidente
    if (incident.id_usuario !== userId) {
      throw new ForbiddenException('No tienes permiso para ver este incidente');
    }

    const evidences = await this.evidenceService.findEvidencesByIncidentId(id);

    return {
      ...incident,
      evidencias: evidences
    };
  }

  /**
   * Actualizar un incidente con validación de permisos
   * @param id - ID del incidente
   * @param userId - ID del usuario autenticado
   * @param data - Datos a actualizar
   * @param files - Nuevos archivos de evidencia
   * @param evidenciasAEliminar - IDs de evidencias a eliminar
   */
  async updateIncident(
    id: number,
    userId: number, // ← NUEVO: ID del usuario autenticado
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

      // ✅ VALIDACIÓN: Solo el dueño puede editar su incidente
      if (incident.id_usuario !== userId) {
        throw new ForbiddenException('No tienes permiso para editar este incidente');
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

  /**
   * Eliminar un incidente (soft delete) con validación de permisos
   * @param id - ID del incidente
   * @param userId - ID del usuario autenticado
   */
  async deleteIncident(id: number, userId: number) {
    // 1. Verificar que el incidente existe
    const incident = await this.incidentsRepo.findIncidentById(id);
    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    // ✅ VALIDACIÓN: Solo el dueño puede eliminar su incidente
    if (incident.id_usuario !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este incidente');
    }

    // 2. Realizar soft delete (cambiar estatus a 3)
    return this.updateIncident(id, userId, { id_estatus: 3 });
  }

  /**
   * Obtener todos los incidentes de un usuario específico
   * @param userId - ID del usuario
   */
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

  /**
   * Obtener el estatus de un incidente con validación de permisos
   * @param incidentId - ID del incidente
   * @param userId - ID del usuario autenticado
   */
  async getIncidentStatus(incidentId: number, userId: number) {
    // 1. Verificar que el incidente existe
    const incident = await this.incidentsRepo.findIncidentById(incidentId);
    
    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${incidentId} no encontrado`);
    }

    // 2. ✅ VALIDACIÓN: Solo el dueño puede ver el estatus de su incidente
    if (incident.id_usuario !== userId) {
      throw new ForbiddenException('No tienes permiso para ver el estatus de este incidente');
    }

    // 3. Obtener el estatus desde la tabla estatus usando el id_estatus del incidente
    const estatusInfo = await this.incidentsRepo.getIncidentStatus(incident.id_estatus);
    
    if (!estatusInfo) {
      throw new NotFoundException(`Estatus no encontrado para el incidente`);
    }

    return {
      id_incidente: incident.id,
      id_estatus: incident.id_estatus,
      estatus: estatusInfo.estatus,
      titulo: incident.titulo
    };

  }
  

  /**
   * Obtener el nombre de usuario asociado a un incidente con validación de permisos
   * @param incidentId - ID del incidente
   * @param userId - ID del usuario autenticado
   */
  async getIncidentUsername(incidentId: number, userId: number) {
    // 1. Verificar que el incidente existe
    const incident = await this.incidentsRepo.findIncidentById(incidentId);
    
    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${incidentId} no encontrado`);
    }

    // 2. ✅ VALIDACIÓN: Solo el dueño puede ver información del incidente
    if (incident.id_usuario !== userId) {
      throw new ForbiddenException('No tienes permiso para ver información de este incidente');
    }

    // 3. Obtener el nombre del usuario desde la tabla usuario
    const usuarioInfo = await this.incidentsRepo.getIncidentUsername(incident.id_usuario);
    
    if (!usuarioInfo) {
      throw new NotFoundException(`Usuario no encontrado para el incidente`);
    }

    return {
      id_incidente: incident.id,
      id_usuario: incident.id_usuario,
      nombre_completo: usuarioInfo.nombreCompleto,
      titulo: incident.titulo
    };
  }

  /**
   * Obtener los incidentes más recientes del usuario autenticado (últimos 5)
   * Solo retorna incidentes del usuario que hace la petición
   * @param userId - ID del usuario autenticado
   */
  async findRecentIncidents(userId: number) {
    // ✅ Obtener SOLO los incidentes del usuario autenticado
    const incidents = await this.incidentsRepo.findIncidentsByUserId(userId);
    
    if (!incidents || incidents.length === 0) {
      throw new NotFoundException('No se encontraron incidentes recientes');
    }

    // Ordenar por fecha de actualización descendente y tomar los últimos 5
    const recentIncidents = incidents
      .sort((a, b) => {
        const dateA = new Date(a.fecha_actualizacion).getTime();
        const dateB = new Date(b.fecha_actualizacion).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    // Obtener evidencias para cada incidente
    const incidentsWithEvidences = await Promise.all(
      recentIncidents.map(async (incident) => {
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

  /**
   * Obtener estadísticas globales de incidentes
   * Este endpoint retorna estadísticas de TODOS los incidentes (no filtrado por usuario)
   * Útil para dashboards administrativos
   */
  async getIncidentStatistics() {
    const statistics = await this.incidentsRepo.getIncidentStatistics();
    
    if (!statistics || statistics.total_incidentes === 0) {
      throw new NotFoundException('No se encontraron datos para generar estadísticas');
    }

    return statistics;
  }
  
  /**
   * [ADMIN] Obtener un incidente por ID sin validación de permisos
   * Los administradores pueden ver cualquier incidente
   * @param id - ID del incidente
   */
  async findIncidentByIdAdmin(id: number) {
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

  /**
   * [ADMIN] Actualizar un incidente sin validación de permisos
   * Los administradores pueden editar cualquier incidente
   * @param id - ID del incidente
   * @param data - Datos a actualizar
   */
  async updateIncidentAdmin(id: number, data: Partial<Incident>) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Se requiere al menos un campo para actualizar');
    }

    // Verificar que el incidente existe
    const incident = await this.incidentsRepo.findIncidentById(id);
    if (!incident) {
      throw new NotFoundException(`Incidente con ID ${id} no encontrado`);
    }

    // Actualizar sin validación de permisos
    await this.incidentsRepo.updateIncident(id, data);

    // Retornar el incidente actualizado
    const updatedIncident = await this.incidentsRepo.findIncidentById(id);
    const evidences = await this.evidenceService.findEvidencesByIncidentId(id);

    return {
      ...updatedIncident,
      evidencias: evidences
    };
  }

    async getUserIncidentSummary(userId: number) {
    const resumen = await this.incidentsRepo.getUserIncidentSummary(userId);
    
    if (!resumen) {
      throw new NotFoundException(`No se encontró resumen para el usuario con id ${userId}`);
    }
  
    return resumen;
  }  

}