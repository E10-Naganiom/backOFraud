/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

export type User = {
    id:number;
    email:string;
    name:string;
    apellido:string;
    contrasena:string;
    salt:string; // Ahora string en lugar de string | null
    is_admin: boolean;
    is_active: boolean;
};

@Injectable()
export class UsersRepository{
    constructor(private readonly db: DbService){}

    async createUser(email:string, name:string, apellido:string, password:string, salt:string, is_admin: boolean, is_active: boolean): Promise<User | null>{
        const sql = `INSERT INTO usuario (email, nombre, apellido, contrasena, salt, es_admin, es_activo) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        const [result]: any = await this.db.getPool().query(sql, [
            email, 
            name, 
            apellido, 
            password, 
            salt, 
            is_admin ? 1 : 0, 
            is_active ? 1 : 0
        ]);
        
        return {
            id: result.insertId,
            email,
            name,
            apellido,
            contrasena: password,
            salt,
            is_admin,
            is_active
        };
    }

    async findByEmail(email:string): Promise<User | null>{
        const sql = `SELECT * FROM usuario WHERE email = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [email]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findById(id:number): Promise<User | null>{
        const sql = `SELECT * FROM usuario WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as User[];
        return result[0] || null;
    }

    async updateUser(id:number, fields: { email?: string; name?: string; apellido?: string; password_hash?: string; is_admin?: boolean; is_active?: boolean; salt?: string }): Promise<User | null>{
        const updates: string[] = [];
        const values: any[] = [];
        
        if(fields.email !== undefined){
            updates.push(`email = ?`);
            values.push(fields.email);
        }
        if(fields.name !== undefined){
            updates.push(`nombre = ?`);
            values.push(fields.name);
        }
        if(fields.apellido !== undefined){
            updates.push(`apellido = ?`);
            values.push(fields.apellido);
        }
        if(fields.password_hash !== undefined){
            updates.push(`contrasena = ?`);
            values.push(fields.password_hash);
        }
        if(fields.is_active !== undefined){
            updates.push(`es_activo = ?`);
            values.push(fields.is_active ? 1 : 0);
        }
        if(fields.is_admin !== undefined){
            updates.push(`es_admin = ?`);
            values.push(fields.is_admin ? 1 : 0);
        }
        if(fields.salt !== undefined){
            updates.push(`salt = ?`);
            values.push(fields.salt); // Ahora acepta string vacío
        }
        
        if(updates.length === 0) return this.findById(id);

        const sql = `UPDATE usuario SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        
        await this.db.getPool().query(sql, values);
        return this.findById(id);
    }

    async findAllUsers(): Promise<User[]> {
        const sql = `SELECT * FROM usuario`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as User[];
    }
}