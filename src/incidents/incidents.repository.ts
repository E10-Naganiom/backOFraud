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
  fecha_incidente: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  id_usuario: number;
  supervisor?: number;
  id_estatus: number;
  es_anonimo: boolean;
}

@Injectable()
export class IncidentsRepository {
  constructor(private readonly db: DbService) {}

  async createIncident(data: Omit<Incident, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Incident | null> {
    const sql = `
      INSERT INTO incidente (
        titulo, id_categoria, nombre_atacante, telefono, correo,
        user_red, red_social, descripcion, fecha_incidente,
        id_usuario, supervisor, id_estatus, es_anonimo
      ) VALUES (
        '${data.titulo}', ${data.id_categoria}, ${data.nombre_atacante ? `'${data.nombre_atacante}'` : null},
        ${data.telefono ? `'${data.telefono}'` : null}, ${data.correo ? `'${data.correo}'` : null},
        ${data.user_red ? `'${data.user_red}'` : null}, ${data.red_social ? `'${data.red_social}'` : null},
        '${data.descripcion}', '${data.fecha_incidente}', ${data.id_usuario},
        ${data.supervisor ?? null}, ${data.id_estatus}, ${data.es_anonimo ? 1 : 0}
      )
    `;
    const [result]: any = await this.db.getPool().query(sql);

    return {
      id: result.insertId,
      ...data,
    };
  }

  async findAll(): Promise<Incident[]> {
    const sql = `SELECT * FROM incidente`;
    const [rows]: any = await this.db.getPool().query(sql);
    return rows;
  }

  async findById(id: number): Promise<Incident | null> {
    const sql = `SELECT * FROM incidente WHERE id = ${id}`;
    const [rows]: any = await this.db.getPool().query(sql);
    return rows[0] || null;
  }

  async updateIncident(id: number, data: Partial<Incident>): Promise<void> {
    const updates = Object.entries(data)
      .map(([key, value]) => `${key} = ${value === null || value === undefined ? 'NULL' : `'${value}'`}`)
      .join(', ');
    const sql = `UPDATE incidente SET ${updates} WHERE id = ${id}`;
    await this.db.getPool().query(sql);
  }

  async deleteIncident(id: number): Promise<void> {
    const sql = `DELETE FROM incidente WHERE id = ${id}`;
    await this.db.getPool().query(sql);
  }
}
