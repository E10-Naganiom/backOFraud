/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request';

/**
 * Decorador para obtener el usuario autenticado desde el token JWT
 * Uso: @CurrentUser() user: UserProfile
 * 
 * Ejemplo:
 * @Post()
 * async createIncident(@CurrentUser() user: UserProfile, @Body() dto: CreateIncidentDto) {
 *   console.log(user.id, user.email, user.name);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user?.profile;
  },
);