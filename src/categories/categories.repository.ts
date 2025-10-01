import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

export interface Category {
  id: number;
  titulo: string;
  descripcion: string;
  id_riesgo: number;
  senales?: string;
  prevencion?: string;
  acciones?: string;
  ejemplos?: string;
}

export interface CategoryWithRisk extends Category {
  nivel_riesgo?: string;
}

@Injectable()
export class CategoriesRepository {
  constructor(private readonly db: DbService) {}

  async createCategory(
    titulo: string,
    descripcion: string,
    id_riesgo: number,
    senales?: string,
    prevencion?: string,
    acciones?: string,
    ejemplos?: string
  ): Promise<Category | null> {
    const sql = `
      INSERT INTO categoria (
        titulo, descripcion, id_riesgo, senales, prevencion, acciones, ejemplos
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result]: any = await this.db.getPool().query(sql, [
      titulo,
      descripcion,
      id_riesgo,
      senales || null,
      prevencion || null,
      acciones || null,
      ejemplos || null
    ]);

    return {
      id: result.insertId,
      titulo,
      descripcion,
      id_riesgo,
      senales,
      prevencion,
      acciones,
      ejemplos
    };
  }

  async findAllCategories(): Promise<CategoryWithRisk[]> {
    const sql = `
      SELECT 
        c.id,
        c.titulo,
        c.descripcion,
        c.id_riesgo,
        c.senales,
        c.prevencion,
        c.acciones,
        c.ejemplos,
        r.descripcion AS nivel_riesgo
      FROM categoria c
      INNER JOIN riesgo r ON c.id_riesgo = r.id
      ORDER BY r.id DESC, c.titulo ASC
    `;
    const [rows]: any = await this.db.getPool().query(sql);
    return rows as CategoryWithRisk[];
  }

  async findCategoryById(id: number): Promise<CategoryWithRisk | null> {
    const sql = `
      SELECT 
        c.id,
        c.titulo,
        c.descripcion,
        c.id_riesgo,
        c.senales,
        c.prevencion,
        c.acciones,
        c.ejemplos,
        r.descripcion AS nivel_riesgo
      FROM categoria c
      INNER JOIN riesgo r ON c.id_riesgo = r.id
      WHERE c.id = ?
    `;
    const [rows]: any = await this.db.getPool().query(sql, [id]);
    return rows[0] || null;
  }

  async findCategoriesByRisk(id_riesgo: number): Promise<CategoryWithRisk[]> {
    const sql = `
      SELECT 
        c.id,
        c.titulo,
        c.descripcion,
        c.id_riesgo,
        c.senales,
        c.prevencion,
        c.acciones,
        c.ejemplos,
        r.descripcion AS nivel_riesgo
      FROM categoria c
      INNER JOIN riesgo r ON c.id_riesgo = r.id
      WHERE c.id_riesgo = ?
      ORDER BY c.titulo ASC
    `;
    const [rows]: any = await this.db.getPool().query(sql, [id_riesgo]);
    return rows as CategoryWithRisk[];
  }

  async getCategoryStatistics(id: number): Promise<any> {
    const sql = `
      SELECT 
        c.id,
        c.titulo,
        COUNT(i.id) AS total_incidentes,
        SUM(CASE WHEN i.id_estatus IN (1, 2, 3) THEN 1 ELSE 0 END) AS incidentes_activos,
        SUM(CASE WHEN i.id_estatus IN (4, 5) THEN 1 ELSE 0 END) AS incidentes_cerrados,
        AVG(CASE 
          WHEN i.id_estatus IN (4, 5) 
          THEN TIMESTAMPDIFF(HOUR, i.fecha_creacion, i.fecha_actualizacion) 
        END) AS promedio_horas_resolucion
      FROM categoria c
      LEFT JOIN incidente i ON c.id = i.id_categoria
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const [rows]: any = await this.db.getPool().query(sql, [id]);
    return rows[0] || null;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.titulo !== undefined) {
      fields.push('titulo = ?');
      values.push(data.titulo);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.id_riesgo !== undefined) {
      fields.push('id_riesgo = ?');
      values.push(data.id_riesgo);
    }
    if (data.senales !== undefined) {
      fields.push('senales = ?');
      values.push(data.senales);
    }
    if (data.prevencion !== undefined) {
      fields.push('prevencion = ?');
      values.push(data.prevencion);
    }
    if (data.acciones !== undefined) {
      fields.push('acciones = ?');
      values.push(data.acciones);
    }
    if (data.ejemplos !== undefined) {
      fields.push('ejemplos = ?');
      values.push(data.ejemplos);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const sql = `UPDATE categoria SET ${fields.join(', ')} WHERE id = ?`;
    await this.db.getPool().query(sql, values);
  }

  async deleteCategory(id: number): Promise<void> {
    // Verificar si hay incidentes asociados
    const checkSql = `SELECT COUNT(*) as count FROM incidente WHERE id_categoria = ?`;
    const [checkResult]: any = await this.db.getPool().query(checkSql, [id]);
    
    if (checkResult[0].count > 0) {
      throw new Error('Cannot delete category with associated incidents');
    }

    const sql = `DELETE FROM categoria WHERE id = ?`;
    await this.db.getPool().query(sql, [id]);
  }
}
