import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy{
    private pool:Pool;
    onModuleInit(): void {
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