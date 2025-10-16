/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EvidenceRepository, Evidence } from './evidence.repository';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EvidenceService {
  private readonly MAX_EVIDENCES_PER_INCIDENT = 5;

  constructor(private readonly evidenceRepo: EvidenceRepository) {}

  async createEvidence(id_incidente: number, url: string): Promise<Evidence> {
    // Validar límite de evidencias
    const currentCount = await this.evidenceRepo.countEvidencesByIncidentId(id_incidente);
    if (currentCount >= this.MAX_EVIDENCES_PER_INCIDENT) {
      throw new BadRequestException(
        `Un incidente no puede tener más de ${this.MAX_EVIDENCES_PER_INCIDENT} evidencias`
      );
    }

    return this.evidenceRepo.createEvidence(id_incidente, url);
  }

  async createMultipleEvidences(id_incidente: number, urls: string[]): Promise<Evidence[]> {
    if (urls.length === 0) return [];

    // Validar límite de evidencias
    const currentCount = await this.evidenceRepo.countEvidencesByIncidentId(id_incidente);
    const totalAfterInsert = currentCount + urls.length;

    if (totalAfterInsert > this.MAX_EVIDENCES_PER_INCIDENT) {
      throw new BadRequestException(
        `Un incidente no puede tener más de ${this.MAX_EVIDENCES_PER_INCIDENT} evidencias. ` +
        `Actualmente tiene ${currentCount} y está intentando agregar ${urls.length}.`
      );
    }

    return this.evidenceRepo.createMultipleEvidences(id_incidente, urls);
  }

  async findEvidencesByIncidentId(id_incidente: number): Promise<Evidence[]> {
    return this.evidenceRepo.findEvidencesByIncidentId(id_incidente);
  }

  async deleteEvidence(id: number): Promise<void> {
    const evidence = await this.evidenceRepo.findEvidenceById(id);
    
    if (!evidence) {
      throw new NotFoundException(`Evidencia con ID ${id} no encontrada`);
    }

    // Eliminar archivo físico
    try {
      const filePath = path.join(__dirname, '../../', evidence.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error al eliminar archivo físico: ${error.message}`);
      // Continuar con la eliminación del registro aunque falle el archivo
    }

    // Eliminar registro de la base de datos
    await this.evidenceRepo.deleteEvidence(id);
  }

  async deleteMultipleEvidences(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.deleteEvidence(id);
    }
  }

  async getEvidenceCount(id_incidente: number): Promise<number> {
    return this.evidenceRepo.countEvidencesByIncidentId(id_incidente);
  }

  /**
   * Eliminar una evidencia con validación de permisos
   * @param evidenceId - ID de la evidencia
   * @param incidentId - ID del incidente (para validación)
   * @param userId - ID del usuario autenticado
   */
  async deleteEvidenceSecure(evidenceId: number, incidentId: number, userId: number): Promise<void> {
    // Verificar que la evidencia existe y pertenece al incidente correcto
    const evidence = await this.evidenceRepo.findEvidenceById(evidenceId);
    
    if (!evidence) {
      throw new NotFoundException(`Evidencia con ID ${evidenceId} no encontrada`);
    }

    // Validar que la evidencia pertenece al incidente indicado
    if (evidence.id_incidente !== incidentId) {
      throw new BadRequestException('La evidencia no pertenece al incidente especificado');
    }

    // Nota: La validación de que el incidente pertenece al usuario
    // se hace en el controller antes de llamar a este método
    await this.deleteEvidence(evidenceId);
  }
}