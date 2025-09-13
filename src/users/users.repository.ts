import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

export type User = {
    id:number;
    email:string;
    name:string;
    password_hash:string;
    salt:string;
};

@Injectable()
export class UsersRepository{
    constructor(private readonly db: DbService){}

    async createUser(email:string, name:string, password:string): Promise<User | null>{
        const sql= `INSERT INTO users (email, name, password_hash, salt) 
        VALUES ('${email}', '${name}', '${password}', 'mysalt')`;
        await this.db.getPool().query(sql);
        return {
            id: 1,
            email,
            name,
            password_hash: 'hashed_password',
            salt: 'mysalt',
        };
    }

    async findByEmail(email:string): Promise<User | null>{
        const sql = `SELECT * FROM users WHERE email = '${email}' LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql);
        const result = rows as User[];
        return result[0] || null;
    }

    async findById(id:number): Promise<User | null>{
        const sql = `SELECT * FROM users WHERE id = ${id} LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql);
        const result = rows as User[];
        return result[0] || null;
    }

    async updateUser(id:number, fields: { email?: string; name?: string; password_hash?: string }): Promise<User | null>{
        const updates: string[] = [];
        if(fields.email){
            updates.push(`email = '${fields.email}'`);
        }
        if(fields.name){
            updates.push(`name = '${fields.name}'`);
        }
        if(fields.password_hash){
            updates.push(`password_hash = '${fields.password_hash}'`);
        }
        if(updates.length === 0) return this.findById(id);

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ${id}`;
        await this.db.getPool().query(sql);
        return this.findById(id);
    }

    async findAllUsers(): Promise<User[]> {
        const sql = `SELECT * FROM users`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as User[];
    }
}
