/* eslint-disable prettier/prettier */
import { Controller, Get, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';

@ApiTags('Modulo de Evidencias')
@Controller('incidents/:incidentId/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @ApiOperation({ summary: 'Obtener todas las evidencias de un incidente' })
  @ApiResponse({ status: 200, description: 'Lista de evidencias obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @Get()
  async getIncidentEvidences(@Param('incidentId') incidentId: string) {
    const evidences = await this.evidenceService.findEvidencesByIncidentId(Number(incidentId));
    return {
      incidentId: Number(incidentId),
      count: evidences.length,
      evidencias: evidences
    };
  }

  @ApiOperation({ summary: 'Eliminar una evidencia específica de un incidente' })
  @ApiResponse({ status: 200, description: 'Evidencia eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Evidencia no encontrada.' })
  @Delete(':evidenceId')
  async deleteEvidence(
    @Param('incidentId') incidentId: string,
    @Param('evidenceId') evidenceId: string
  ) {
    await this.evidenceService.deleteEvidence(Number(evidenceId));
    return {
      message: 'Evidencia eliminada exitosamente',
      incidentId: Number(incidentId),
      evidenceId: Number(evidenceId)
    };
  }
}