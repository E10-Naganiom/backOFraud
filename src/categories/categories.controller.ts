import {Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Módulo de Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Crear una nueva categoría de incidente' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida exitosamente.' })
  @Get()
  async findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @ApiOperation({ summary: 'Obtener una categoría por su ID' })
  @ApiResponse({ status: 200, description: 'Categoría obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: Number })
  @Get(':id')
  async findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findCategoryById(id);
  }

  @ApiOperation({ summary: 'Obtener categorías por nivel de riesgo' })
  @ApiResponse({ status: 200, description: 'Categorías filtradas por riesgo.' })
  @ApiResponse({ status: 400, description: 'Nivel de riesgo inválido.' })
  @ApiParam({ name: 'id_riesgo', description: 'ID del nivel de riesgo (1-4)', type: Number })
  @Get('risk/:id_riesgo')
  async findCategoriesByRisk(@Param('id_riesgo', ParseIntPipe) id_riesgo: number) {
    return this.categoriesService.findCategoriesByRisk(id_riesgo);
  }

  @ApiOperation({ summary: 'Obtener estadísticas de una categoría' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: Number })
  @Get(':id/statistics')
  async getCategoryStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getCategoryStatistics(id);
  }

  @ApiOperation({ summary: 'Actualizar una categoría por su ID' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiBody({ type: UpdateCategoryDto })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    await this.categoriesService.updateCategory(id, updateCategoryDto);
    return { message: 'Categoría actualizada exitosamente' };
  }

  @ApiOperation({ summary: 'Eliminar una categoría por su ID' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente.' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar la categoría (tiene incidentes asociados).' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.deleteCategory(id);
    return { message: 'Categoría eliminada exitosamente' };
  }
}