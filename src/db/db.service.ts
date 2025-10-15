/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy{
    private pool:Pool;
    onModuleInit(): void {
        // ← AGREGAR ESTO PARA DEBUG
        console.log('🔍 DB CONFIG DEBUG:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***EXISTE***' : '❌ UNDEFINED');
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_DATABASE:', process.env.DB_DATABASE);
        console.log('========================');
        
        this.pool = createPool({
            port: Number(process.env.DB_PORT) || 3306,
            host: process.env.DB_HOST,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'demo_452'
        });
    }
    onModuleDestroy() {
        void this.pool.end();
    }
    getPool():Pool{
        return this.pool;
    }
    

}