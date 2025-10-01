import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesRepository, Category, CategoryWithRisk } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async createCategory(data: {
    titulo: string;
    descripcion: string;
    id_riesgo: number;
    senales?: string;
    prevencion?: string;
    acciones?: string;
    ejemplos?: string;
  }): Promise<Category | null> {
    try {
      // Validar que el nivel de riesgo existe (1-4)
      if (data.id_riesgo < 1 || data.id_riesgo > 4) {
        throw new BadRequestException('El nivel de riesgo debe estar entre 1 y 4');
      }

      return this.categoriesRepo.createCategory(
        data.titulo,
        data.descripcion,
        data.id_riesgo,
        data.senales,
        data.prevencion,
        data.acciones,
        data.ejemplos
      );
    } catch (error) {
      console.error('Error inesperado en createCategory:', error);
      throw error;
    }
  }

  async findAllCategories(): Promise<CategoryWithRisk[]> {
    return this.categoriesRepo.findAllCategories();
  }

  async findCategoryById(id: number): Promise<CategoryWithRisk> {
    const category = await this.categoriesRepo.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async findCategoriesByRisk(id_riesgo: number): Promise<CategoryWithRisk[]> {
    if (id_riesgo < 1 || id_riesgo > 4) {
      throw new BadRequestException('El nivel de riesgo debe estar entre 1 y 4');
    }
    return this.categoriesRepo.findCategoriesByRisk(id_riesgo);
  }

  async getCategoryStatistics(id: number): Promise<any> {
    const stats = await this.categoriesRepo.getCategoryStatistics(id);
    if (!stats) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return stats;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<void> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Los datos de actualización son requeridos');
    }

    // Verificar que la categoría existe
    await this.findCategoryById(id);

    // Validar nivel de riesgo si se proporciona
    if (data.id_riesgo !== undefined && (data.id_riesgo < 1 || data.id_riesgo > 4)) {
      throw new BadRequestException('El nivel de riesgo debe estar entre 1 y 4');
    }

    return this.categoriesRepo.updateCategory(id, data);
  }

  async deleteCategory(id: number): Promise<void> {
    // Verificar que la categoría existe
    await this.findCategoryById(id);

    try {
      return await this.categoriesRepo.deleteCategory(id);
    } catch (error: any) {
      if (error.message.includes('associated incidents')) {
        throw new BadRequestException('No se puede eliminar una categoría con incidentes asociados');
      }
      throw error;
    }
  }
}
