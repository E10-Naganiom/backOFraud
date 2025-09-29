import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

export type User = {
    id:number;
    email:string;
    name:string;
    apellido:string;
    contrasena:string;
    salt:string;
    is_admin: boolean;
    is_active: boolean;
};

@Injectable()
export class UsersRepository{
    constructor(private readonly db: DbService){}

    async createUser(email:string, name:string, apellido:string, password:string, salt:string, is_admin: boolean, is_active: boolean): Promise<User | null>{
        const sql= `INSERT INTO usuario (email, nombre, apellido, contrasena, salt, es_admin, es_activo) 
        VALUES ('${email}', '${name}', '${apellido}', '${password}', '${salt}', ${is_admin}, ${is_active})`;
        await this.db.getPool().query(sql);
        return {
            id: 1,
            email,
            name,
            apellido,
            contrasena: 'hashed_password',
            salt: 'mysalt',
            is_admin,
            is_active
        };
    }

    async findByEmail(email:string): Promise<User | null>{
        const sql = `SELECT * FROM usuario WHERE email = '${email}' LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql);
        const result = rows as User[];
        return result[0] || null;
    }

    async findById(id:number): Promise<User | null>{
        const sql = `SELECT * FROM usuario WHERE id = ${id} LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql);
        const result = rows as User[];
        return result[0] || null;
    }

    async updateUser(id:number, fields: { email?: string; name?: string; apellido?: string; password_hash?: string; is_admin?: boolean; is_active?: boolean }): Promise<User | null>{
        const updates: string[] = [];
        if(fields.email){
            updates.push(`email = '${fields.email}'`);
        }
        if(fields.name){
            updates.push(`nombre = '${fields.name}'`);
        }
        if(fields.apellido){
            updates.push(`apellido = '${fields.apellido}'`);
        }
        if(fields.password_hash){
            updates.push(`contrasena = '${fields.password_hash}'`);
        }
        if(fields.is_active !== undefined){
            updates.push(`es_activo = ${fields.is_active ? 1 : 0}`);
        }
        if(fields.is_admin !== undefined){
            updates.push(`es_admin = ${fields.is_admin ? 1 : 0}`);
        }
        if(updates.length === 0) return this.findById(id);

        const sql = `UPDATE usuario SET ${updates.join(', ')} WHERE id = ${id}`;
        //console.log(sql);
        await this.db.getPool().query(sql);
        return this.findById(id);
    }

    async findAllUsers(): Promise<User[]> {
        const sql = `SELECT * FROM usuario`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as User[];
    }
}
