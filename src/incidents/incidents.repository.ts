/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import e from 'express';

export interface Incident {
  id: number;
  titulo: string;
  id_categoria: number;
  nombre_atacante?: string;
  telefono?: string;
  correo?: string;
  user_red?: string;
  red_social?: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_usuario: number;
  supervisor?: number;
  id_estatus: number;
  es_anonimo: boolean;
}

@Injectable()
export class IncidentsRepository {
  constructor(private readonly db: DbService) {}

  async createIncident(
    titulo: string,
    id_categoria: number,
    descripcion: string,
    id_usuario: number,
    es_anonimo: boolean,
    supervisor?: number,
    nombre_atacante?: string,
    telefono?: string,
    correo?: string,
    user_red?: string,
    red_social?: string
  ): Promise<Incident> {
    const sql = `
      INSERT INTO incidente (
        titulo, id_categoria, nombre_atacante, telefono, correo,
        user_red, red_social, descripcion,
        id_usuario, supervisor, id_estatus, es_anonimo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `;

    const [result]: any = await this.db.getPool().query(sql, [
      titulo,
      id_categoria,
      nombre_atacante || null,
      telefono || null,
      correo || null,
      user_red || null,
      red_social || null,
      descripcion,
      id_usuario,
      supervisor || null,
      es_anonimo ? 1 : 0
    ]);

    // Retornar el incidente creado con el ID real
    return {
      id: result.insertId,
      titulo,
      id_categoria,
      nombre_atacante,
      telefono,
      correo,
      user_red,
      red_social,
      descripcion,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      id_usuario,
      supervisor,
      id_estatus: 1,
      es_anonimo
    };
  }

  async findAllIncidents(): Promise<Incident[]> {
    const sql = `SELECT * FROM incidente`;
    const [rows]: any = await this.db.getPool().query(sql);
    return rows as Incident[];
  }

  async findIncidentById(id: number): Promise<Incident | null> {
    const sql = `SELECT * FROM incidente WHERE id = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id]);
    return rows[0] || null;
  }

  async updateIncident(id: number, data: Partial<Incident>): Promise<void> {
    const allowedFields = [
      'titulo', 'id_categoria', 'nombre_atacante', 'telefono', 'correo',
      'user_red', 'red_social', 'descripcion', 'supervisor', 'id_estatus'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value === undefined ? null : value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `UPDATE incidente SET ${updates.join(', ')} WHERE id = ?`;
    await this.db.getPool().query(sql, values);
  }

  async deleteIncident(id: number): Promise<void> {
    const sql = `DELETE FROM incidente WHERE id = ?`;
    await this.db.getPool().query(sql, [id]);
  }

  async findIncidentsByUserId(id_usuario: number): Promise<Incident[]> {
    const sql = `SELECT * FROM incidente WHERE id_usuario = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id_usuario]);
    return rows as Incident[];
  }

  async getUserIncidentSummary(userId: number) {
    const sql = `
      SELECT 
        COUNT(*) AS total_incidentes,
        SUM(CASE WHEN id_estatus = 2 THEN 1 ELSE 0 END) AS total_aprobados,
        SUM(CASE WHEN id_estatus = 1 THEN 1 ELSE 0 END) AS total_pendientes,
        SUM(CASE WHEN id_estatus = 3 THEN 1 ELSE 0 END) AS total_rechazados
      FROM incidente
      WHERE id_usuario = ?;
    `;
  
    const [rows]: any = await this.db.getPool().query(sql, [userId]);
    const result = rows[0];

    return {
      total_incidentes: Number(result.total_incidentes),
      total_aprobados: Number(result.total_aprobados),
      total_pendientes: Number(result.total_pendientes),
      total_rechazados: Number(result.total_rechazados),
    };
  }

  async getIncidentStatus(id: number): Promise<{ estatus: String } | null> {
    const sql = `SELECT descripcion FROM estatus WHERE id = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id]);
    return rows[0] || null;
  }

  async getIncidentUsername(id: number): Promise<{ nombreCompleto: string } | null> {
    const sql = `SELECT nombre,apellido FROM usuario WHERE id = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id]);
    if (rows[0]) {
      return { nombreCompleto: rows[0].nombre + ' ' + rows[0].apellido };
    }
    else {
      return null;
    }
  }

  async findRecentIncidents(): Promise<Incident[]> {
    const sql = `SELECT * FROM incidente WHERE id_estatus = 2 ORDER BY fecha_actualizacion DESC LIMIT 5`;
    const [rows]: any = await this.db.getPool().query(sql);
    return rows as Incident[];
  }

  async getIncidentStatistics() {
    const pool = this.db.getPool();
  
    // Total de incidentes
    const [totalIncidentesResult]: any = await pool.query(
      'SELECT COUNT(*) AS total FROM incidente'
    );
    const totalIncidentes = totalIncidentesResult[0].total;
  
    // Total de categorías distintas
    const [totalCategoriasResult]: any = await pool.query(
      'SELECT COUNT(*) AS total FROM categoria'
    );
    const totalCategorias = totalCategoriasResult[0].total;
  
    // Incidentes por estatus
    const [porEstatus]: any = await pool.query(`
      SELECT e.descripcion AS estatus, COUNT(i.id) AS total 
      FROM estatus e 
      LEFT JOIN incidente i ON e.id = i.id_estatus 
      GROUP BY e.id, e.descripcion 
      ORDER BY e.id
    `);
  
    // Incidentes por categoría
    const [porCategoria]: any = await pool.query(`
      SELECT c.titulo, COUNT(i.id_categoria) AS total 
      FROM categoria c 
      LEFT JOIN incidente i ON c.id = i.id_categoria 
      GROUP BY c.id
    `);
  
    // Métodos de contacto
    const [metodosContactoResult]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN telefono IS NOT NULL THEN 1 ELSE 0 END) AS con_telefono,
        SUM(CASE WHEN correo IS NOT NULL THEN 1 ELSE 0 END) AS con_email,
        SUM(CASE WHEN (user_red IS NOT NULL OR red_social IS NOT NULL) THEN 1 ELSE 0 END) AS con_redes_sociales
      FROM incidente
    `);
    const metodosContacto = metodosContactoResult[0];
  
    // Redes sociales (solo las no nulas)
    const [redesSociales]: any = await pool.query(`
      SELECT red_social AS nombre, COUNT(*) AS total 
      FROM incidente 
      WHERE red_social IS NOT NULL AND red_social != ''
      GROUP BY red_social
    `);
  
    // 🔹 Función para redondear sin perder el tipo numérico
    const round2 = (n: number) => Math.round(n * 100) / 100;
  
    // --- Cálculos con porcentajes numéricos ---
    const porEstatusConPorcentaje = porEstatus.map((e: any) => ({
      ...e,
      porcentaje: totalIncidentes > 0 ? round2((e.total / totalIncidentes) * 100) : 0,
    }));
  
    const porCategoriaConPorcentaje = porCategoria.map((c: any) => ({
      ...c,
      porcentaje: totalIncidentes > 0 ? round2((c.total / totalIncidentes) * 100) : 0,
    }));
  
    const metodosContactoConPorcentaje = Object.entries(metodosContacto).map(
      ([key, value]: [string, any]) => ({
        metodo: key,
        total: Number(value),
        porcentaje: totalIncidentes > 0 ? round2((Number(value) / totalIncidentes) * 100) : 0,
      })
    );
  
    const totalConRedSocial = redesSociales.reduce(
      (acc: number, r: any) => acc + r.total,
      0
    );
  
    const redesSocialesConPorcentaje = redesSociales.map((r: any) => ({
      ...r,
      porcentaje:
        totalConRedSocial > 0 ? round2((r.total / totalConRedSocial) * 100) : 0,
    }));
  
    // 🧠 Estructura final del resultado
    return {
      total_incidentes: totalIncidentes,
      total_categorias: totalCategorias,
      por_estatus: porEstatusConPorcentaje,
      por_categoria: porCategoriaConPorcentaje,
      metodos_contacto: metodosContactoConPorcentaje,
      redes_sociales: redesSocialesConPorcentaje,
    };
  }
  
  
}