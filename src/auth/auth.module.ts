import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { TokenService } from "./token.service";
import { AuthController } from "./auth.controller";


@Module({
    imports: [UsersModule],
    providers: [TokenService],
    controllers: [AuthController]
})
export class AuthModule {}