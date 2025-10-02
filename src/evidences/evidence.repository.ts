/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

export interface Evidence {
  id: number;
  id_incidente: number;
  url: string;
}

@Injectable()
export class EvidenceRepository {
  constructor(private readonly db: DbService) {}

  async createEvidence(id_incidente: number, url: string): Promise<Evidence> {
    const sql = `INSERT INTO evidencia (id_incidente, url) VALUES (?, ?)`;
    const [result]: any = await this.db.getPool().query(sql, [id_incidente, url]);

    return {
      id: result.insertId,
      id_incidente,
      url
    };
  }

  async createMultipleEvidences(id_incidente: number, urls: string[]): Promise<Evidence[]> {
    if (urls.length === 0) return [];

    const values = urls.map(url => [id_incidente, url]);
    const sql = `INSERT INTO evidencia (id_incidente, url) VALUES ?`;
    
    await this.db.getPool().query(sql, [values]);

    // Obtener las evidencias recién creadas
    return this.findEvidencesByIncidentId(id_incidente);
  }

  async findEvidencesByIncidentId(id_incidente: number): Promise<Evidence[]> {
    const sql = `SELECT * FROM evidencia WHERE id_incidente = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id_incidente]);
    return rows as Evidence[];
  }

  async findEvidenceById(id: number): Promise<Evidence | null> {
    const sql = `SELECT * FROM evidencia WHERE id = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id]);
    return rows[0] || null;
  }

  async deleteEvidence(id: number): Promise<void> {
    const sql = `DELETE FROM evidencia WHERE id = ?`;
    await this.db.getPool().query(sql, [id]);
  }

  async deleteEvidencesByIncidentId(id_incidente: number): Promise<void> {
    const sql = `DELETE FROM evidencia WHERE id_incidente = ?`;
    await this.db.getPool().query(sql, [id_incidente]);
  }

  async countEvidencesByIncidentId(id_incidente: number): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM evidencia WHERE id_incidente = ?`;
    const [rows]: any = await this.db.getPool().query(sql, [id_incidente]);
    return rows[0].count;
  }
}