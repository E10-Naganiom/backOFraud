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

  async createIncident(titulo: string, id_categoria: number, descripcion: string, id_usuario: number, es_anonimo: boolean, supervisor?: number, nombre_atacante?: string, telefono?: string, correo?: string, user_red?: string, red_social?: string ): Promise<Incident | null> {
    const sql = `
      INSERT INTO incidente (
        titulo, id_categoria, nombre_atacante, telefono, correo,
        user_red, red_social, descripcion,
        id_usuario, supervisor, id_estatus, es_anonimo
      ) VALUES (
        '${titulo}', ${id_categoria}, ${nombre_atacante ? `'${nombre_atacante}'` : null},
        ${telefono ? `'${telefono}'` : null}, ${correo ? `'${correo}'` : null},
        ${user_red ? `'${user_red}'` : null}, ${red_social ? `'${red_social}'` : null},
        '${descripcion}', ${id_usuario},
        ${supervisor ?? null}, 1, ${es_anonimo ? 1 : 0}
      )
    `;
    await this.db.getPool().query(sql);

    return {
      id: 1,
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
