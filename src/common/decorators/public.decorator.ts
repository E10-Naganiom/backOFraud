/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para marcar endpoints como públicos (sin autenticación)
 * Uso: @Public()
 * 
 * Ejemplo:
 * @Public()
 * @Post('login')
 * async login() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);