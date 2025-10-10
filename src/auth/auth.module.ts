/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { TokenService } from "./token.service";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        UsersModule,
        JwtModule.register({}), // Requerido para que JwtService esté disponible
    ],
    providers: [TokenService],
    controllers: [AuthController],
    exports: [TokenService], // ← IMPORTANTE: Exportar para uso global
})
export class AuthModule {}