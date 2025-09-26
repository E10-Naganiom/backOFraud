import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

export type Incidente = {
    id: number;
    titulo: string;
    id_categoria: number;
    nombre_atacante?: string;
    telefono?: string;
    correo?: string;
    user?: string;
    red_social?: string;
    descripcion?: string;
    fecha_incidente?: Date;
    fecha_creacion: Date;
    fecha_actualizado: Date;
    id_usuario?: number;
    superviser?: number;
    id_status: number;
    is_anonym: boolean;
};

@Injectable()
export class IncidentsRepository {
    constructor(private readonly db: DbService) {}

    async createIncident(data: {
        titulo: string;
        id_categoria: number;
        nombre_atacante?: string;
        telefono?: string;
        correo?: string;
        user?: string;
        red_social?: string;
        descripcion?: string;
        fecha_incidente?: Date;
        id_usuario?: number;
        id_status: number;
        is_anonym: boolean;
    }): Promise<Incidente | null> {
        const fields = ['titulo', 'id_categoria', 'id_status', 'is_anonym', 'fecha_creacion', 'fecha_actualizado'];
        const values = [`'${data.titulo}'`, `${data.id_categoria}`, `${data.id_status}`, `${data.is_anonym ? 1 : 0}`, 'NOW()', 'NOW()'];

        if (data.nombre_atacante) {
            fields.push('nombre_atacante');
            values.push(`'${data.nombre_atacante}'`);
        }
        if (data.telefono) {
            fields.push('telefono');
            values.push(`'${data.telefono}'`);
        }
        if (data.correo) {
            fields.push('correo');
            values.push(`'${data.correo}'`);
        }
        if (data.user) {
            fields.push('user');
            values.push(`'${data.user}'`);
        }
        if (data.red_social) {
            fields.push('red_social');
            values.push(`'${data.red_social}'`);
        }
        if (data.descripcion) {
            fields.push('descripcion');
            values.push(`'${data.descripcion}'`);
        }
        if (data.fecha_incidente) {
            fields.push('fecha_incidente');
            values.push(`'${data.fecha_incidente.toISOString().split('T')[0]}'`);
        }
        if (data.id_usuario) {
            fields.push('id_usuario');
            values.push(`${data.id_usuario}`);
        }

        const sql = `INSERT INTO incidente (${fields.join(', ')}) VALUES (${values.join(', ')})`;
        const [result] = await this.db.getPool().query(sql);
        const insertId = (result as any).insertId;

        return this.findById(insertId);
    }

    async findById(id: number): Promise<Incidente | null> {
        const sql = `SELECT * FROM incidente WHERE id = ${id} LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql);
        const result = rows as Incidente[];
        return result[0] || null;
    }

    async findAll(): Promise<Incidente[]> {
        const sql = `SELECT * FROM incidente ORDER BY fecha_creacion DESC`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as Incidente[];
    }

    async findByCategory(id_categoria: number): Promise<Incidente[]> {
        const sql = `SELECT * FROM incidente WHERE id_categoria = ${id_categoria} ORDER BY fecha_creacion DESC`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as Incidente[];
    }

    async findByUser(id_usuario: number): Promise<Incidente[]> {
        const sql = `SELECT * FROM incidente WHERE id_usuario = ${id_usuario} ORDER BY fecha_creacion DESC`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as Incidente[];
    }

    async findApproved(): Promise<Incidente[]> {
        const sql = `SELECT * FROM incidente WHERE id_status = 2 ORDER BY fecha_creacion DESC`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as Incidente[];
    }

    async updateIncident(id: number, data: {
        titulo?: string;
        id_categoria?: number;
        nombre_atacante?: string;
        telefono?: string;
        correo?: string;
        user?: string;
        red_social?: string;
        descripcion?: string;
        fecha_incidente?: Date;
        superviser?: number;
        id_status?: number;
    }): Promise<Incidente | null> {
        const updates: string[] = ['fecha_actualizado = NOW()'];

        if (data.titulo) updates.push(`titulo = '${data.titulo}'`);
        if (data.id_categoria) updates.push(`id_categoria = ${data.id_categoria}`);
        if (data.nombre_atacante !== undefined) updates.push(`nombre_atacante = ${data.nombre_atacante ? `'${data.nombre_atacante}'` : 'NULL'}`);
        if (data.telefono !== undefined) updates.push(`telefono = ${data.telefono ? `'${data.telefono}'` : 'NULL'}`);
        if (data.correo !== undefined) updates.push(`correo = ${data.correo ? `'${data.correo}'` : 'NULL'}`);
        if (data.user !== undefined) updates.push(`user = ${data.user ? `'${data.user}'` : 'NULL'}`);
        if (data.red_social !== undefined) updates.push(`red_social = ${data.red_social ? `'${data.red_social}'` : 'NULL'}`);
        if (data.descripcion !== undefined) updates.push(`descripcion = ${data.descripcion ? `'${data.descripcion}'` : 'NULL'}`);
        if (data.fecha_incidente) updates.push(`fecha_incidente = '${data.fecha_incidente.toISOString().split('T')[0]}'`);
        if (data.superviser !== undefined) updates.push(`superviser = ${data.superviser ? data.superviser : 'NULL'}`);
        if (data.id_status) updates.push(`id_status = ${data.id_status}`);

        const sql = `UPDATE incidente SET ${updates.join(', ')} WHERE id = ${id}`;
        await this.db.getPool().query(sql);
        return this.findById(id);
    }

    async deleteIncident(id: number): Promise<boolean> {
        const sql = `DELETE FROM incidente WHERE id = ${id}`;
        const [result] = await this.db.getPool().query(sql);
        return (result as any).affectedRows > 0;
    }
}