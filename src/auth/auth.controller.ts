/* eslint-disable prettier/prettier */
import { UsersService } from "src/users/users.service";
import { TokenService } from "./token.service";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { Public } from "src/common/decorators/public.decorator"; // ← NUEVO
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";

class LoginDto {
    @ApiProperty({ example: 'nuevo@example.com', required: true, description: 'Email del usuario' })
    email: string;
    @ApiProperty({ example: 'Pass123', required: true, description: 'Contraseña del usuario' })
    password: string;
}

class RefreshDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', required: true, description: 'Refresh token' })
    token: string;
}

@ApiTags('Módulo de Autenticación')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userService: UsersService
    ) {}

    @Public() // ← NUEVO: Endpoint público (sin autenticación)
    @ApiOperation({ summary: 'Endpoint para iniciar sesión y obtener tokens de acceso y refresh' })
    @ApiBody({ type: LoginDto, examples: {
        Ejemplo: {
            value: { email: 'juan@example.com', password: 'Pass123' }
    }}})
    @ApiResponse({ status: 201, description: 'Login exitoso. Tokens generados correctamente.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
        const user = await this.userService.validateUser(loginDto.email, loginDto.password);
        if (user) {
            const token = await this.tokenService.generateAccessToken(user);
            const refreshToken = await this.tokenService.generateRefreshToken(user);
            return { access_token: token, refresh_token: refreshToken };
        }
        return { error: 'Invalid credentials' };
    }

    @Public() // ← NUEVO: Endpoint público (sin autenticación)
    @ApiOperation({ summary: 'Endpoint para refrescar el token de acceso usando un token de refresh' })
    @ApiBody({ type: RefreshDto, examples: {
        Ejemplo: {
            value: { token: 'REFRESH_TOKEN' }
    }}})
    @ApiResponse({ status: 201, description: 'Token de acceso renovado correctamente.' })
    @ApiResponse({ status: 401, description: 'Token de refresh inválido.' })
    @Post('refresh')
    async refresh(@Body() refreshDto: { token: string }) {
        const payload = await this.tokenService.verifyRefreshToken(refreshDto.token);
        if (payload) {
            const user = await this.userService.findById(Number(payload.sub));
            if (user) {
                const newAccessToken = await this.tokenService.generateAccessToken(user);
                return { access_token: newAccessToken };
            }
        }
        return { error: 'Invalid refresh token' };
    }

    @ApiOperation({ summary: 'Endpoint para obtener el perfil del usuario autenticado' })
    @Get('profile')
    @UseGuards(JwtAuthGuard) // ← Ya no es necesario, pero no hace daño dejarlo
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'El token es invalido o no se envio.' })
    getProfile(@Req() req: AuthenticatedRequest) {
        return {profile: req.user.profile};
    }
}