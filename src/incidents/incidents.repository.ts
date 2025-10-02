/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

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
}