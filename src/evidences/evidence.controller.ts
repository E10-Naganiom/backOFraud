/* eslint-disable prettier/prettier */
import { Controller, Get, Delete, Param, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as tokenService from 'src/auth/token.service';
import { EvidenceService } from './evidence.service';
import { IncidentsService } from '../incidents/incidents.service';

@ApiTags('Modulo de Evidencias')
@ApiBearerAuth() // ← TODOS los endpoints requieren autenticación
@Controller('incidents/:incidentId/evidence')
export class EvidenceController {
  constructor(
    private readonly evidenceService: EvidenceService,
    private readonly incidentsService: IncidentsService // ← Inyectar para validar permisos
  ) {}

  @ApiOperation({ summary: 'Obtener todas las evidencias de un incidente' })
  @ApiResponse({ status: 200, description: 'Lista de evidencias obtenida exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver evidencias de este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get()
  async getIncidentEvidences(
    @CurrentUser() user: tokenService.UserProfile, // ← Usuario autenticado
    @Param('incidentId') incidentId: string
  ) {
    const incidentIdNum = Number(incidentId);

    // ✅ VALIDACIÓN: Verificar que el incidente existe y pertenece al usuario
    await this.incidentsService.findIncidentById(incidentIdNum, user.id);

    // Si llegamos aquí, el usuario tiene permiso para ver el incidente
    const evidences = await this.evidenceService.findEvidencesByIncidentId(incidentIdNum);
    
    return {
      incidentId: incidentIdNum,
      count: evidences.length,
      evidencias: evidences
    };
  }

  @ApiOperation({ summary: 'Eliminar una evidencia específica de un incidente' })
  @ApiResponse({ status: 200, description: 'Evidencia eliminada exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar evidencias de este incidente.' })
  @ApiResponse({ status: 404, description: 'Evidencia o incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Delete(':evidenceId')
  async deleteEvidence(
    @CurrentUser() user: tokenService.UserProfile, // ← Usuario autenticado
    @Param('incidentId') incidentId: string,
    @Param('evidenceId') evidenceId: string
  ) {
    const incidentIdNum = Number(incidentId);
    const evidenceIdNum = Number(evidenceId);

    // ✅ VALIDACIÓN: Verificar que el incidente existe y pertenece al usuario
    await this.incidentsService.findIncidentById(incidentIdNum, user.id);

    // Si llegamos aquí, el usuario tiene permiso para modificar el incidente
    // Ahora validar que la evidencia pertenece a este incidente y eliminarla
    await this.evidenceService.deleteEvidenceSecure(evidenceIdNum, incidentIdNum, user.id);
    
    return {
      message: 'Evidencia eliminada exitosamente',
      incidentId: incidentIdNum,
      evidenceId: evidenceIdNum
    };
  }
}