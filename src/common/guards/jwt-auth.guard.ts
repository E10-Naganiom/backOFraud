/* eslint-disable prettier/prettier */
import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from 'src/auth/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request';

/**
 * Guard que valida JWT en todas las peticiones
 * - Si el endpoint tiene @Public() → permite acceso sin token
 * - Si no es público → valida el token y adjunta el usuario al request
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verificar si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Permitir acceso sin validar token
    }

    // 2. Extraer token del header Authorization
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado. Incluye el header: Authorization Bearer <token>');
    }

    // 3. Validar el token
    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      
      // 4. Adjuntar el usuario al request para que esté disponible con @CurrentUser()
      request.user = {
        ...payload,
        userId: payload.sub, // Assuming 'sub' contains the user ID
        raw: payload // Store the original payload
      };
      
      return true;
    } catch (error) {
      // Manejar diferentes errores de token
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado. Por favor, refresca tu token.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido.');
      }
      throw new UnauthorizedException('Error al validar el token.');
    }
  }

  /**
   * Extrae el token del header Authorization
   * Formato esperado: "Bearer <token>"
   */
  private extractTokenFromHeader(request: AuthenticatedRequest): string | undefined {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}