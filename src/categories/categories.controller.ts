/* eslint-disable prettier/prettier */
import {Controller, Get, Body, Param, ParseIntPipe} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';


@ApiTags('Módulo de Categorías')
@ApiBearerAuth() // ← TODOS los endpoints requieren autenticación
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ========================================================================
  // TODOS LOS ENDPOINTS REQUIEREN AUTENTICACIÓN
  // Esto garantiza comportamiento consistente en la aplicación
  // ========================================================================

  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get()
  async findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @ApiOperation({ summary: 'Obtener una categoría por su ID' })
  @ApiResponse({ status: 200, description: 'Categoría obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: Number })
  @Get(':id')
  async findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findCategoryById(id);
  }

  @ApiOperation({ summary: 'Obtener el nivel del riesgo de una categoría' })
  @ApiResponse({ status: 200, description: 'Nivel de riesgo obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: Number })
  @Get(':id/risk-level')
  async getRiskLevelByCategoryId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getRiskLevelByCategoryId(id);
  }

  @ApiOperation({ summary: 'Obtener numero de reportes por categoria' })
  @ApiResponse({ status: 200, description: 'Número de reportes obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: Number })
  @Get(':id/report-count')
  async getReportCountByCategoryId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getReportCountByCategoryId(id);
  }

  @ApiOperation({ summary: 'Obtener categorías por nivel de riesgo' })
  @ApiResponse({ status: 200, description: 'Categorías filtradas por riesgo.' })
  @ApiResponse({ status: 400, description: 'Nivel de riesgo inválido.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiParam({ name: 'id_riesgo', description: 'ID del nivel de riesgo (1-4)', type: Number })
  @Get('risk/:id_riesgo')
  async findCategoriesByRisk(@Param('id_riesgo', ParseIntPipe) id_riesgo: number) {
    return this.categoriesService.findCategoriesByRisk(id_riesgo);
  }

  @ApiOperation({ summary: 'Obtener estadísticas de una categoría' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: Number })
  @Get(':id/statistics')
  async getCategoryStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getCategoryStatistics(id);
  }

  // NOTA: Los endpoints POST/PUT/DELETE deberían moverse al AdminController
  // ya que solo los administradores deberían poder gestionar categorías
}