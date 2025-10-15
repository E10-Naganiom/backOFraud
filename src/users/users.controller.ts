/* eslint-disable prettier/prettier */
import { Controller, Post, ForbiddenException } from "@nestjs/common";
import { Body, Param, Put, Patch } from "@nestjs/common/decorators";
import { UsersService } from "./users.service";
import { Public } from "src/common/decorators/public.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import * as tokenService from "src/auth/token.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user-dto";
import { UpdateUserDto } from "./dto/update-user-dto";

@ApiTags('Modulo de Usuarios')
@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    // ========================================================================
    // ENDPOINT PÚBLICO - Registro (sin autenticación)
    // ========================================================================

    @Public() // ← Endpoint público (usuarios nuevos no tienen token)
    @ApiOperation({summary: "Endpoint para registro de usuarios"})
    @ApiResponse({status: 201, description: 'Usuario creado exitosamente'})
    @ApiResponse({status: 400, description: 'Error en los datos proporcionados'})
    @ApiResponse({status: 409, description: 'Ya existe una cuenta con este correo'})
    @Post()
    async createUser(@Body() createUserDto:CreateUserDto){
        return this.usersService.createUser(
            createUserDto.email, 
            createUserDto.name, 
            createUserDto.apellido, 
            createUserDto.password
        );
    }

    // ========================================================================
    // ENDPOINTS PROTEGIDOS - Requieren autenticación
    // Usuario solo puede modificar SU PROPIO perfil
    // ========================================================================

    @ApiBearerAuth()
    @ApiOperation({summary: "Endpoint para actualizar el perfil del usuario autenticado"})
    @ApiResponse({status: 200, description: 'Usuario actualizado exitosamente'})
    @ApiResponse({status: 403, description: 'No tienes permiso para actualizar este usuario'})
    @ApiResponse({status: 404, description: 'Usuario no encontrado'})
    @ApiResponse({status: 401, description: 'No autenticado'})
    @ApiBody({type: UpdateUserDto})
    @Put(':id')
    async updateUser(
        @CurrentUser() user: tokenService.UserProfile, // ← Usuario autenticado
        @Param('id') id: string, 
        @Body() updateUserDto: UpdateUserDto
    ){
        const targetUserId = Number(id);

        // ✅ VALIDACIÓN: Usuario solo puede actualizar su propio perfil
        if (user.id !== targetUserId) {
            throw new ForbiddenException('No tienes permiso para actualizar el perfil de otro usuario');
        }

        return this.usersService.updateUser(targetUserId, updateUserDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: "Endpoint para inactivar el perfil del usuario autenticado" })
    @ApiResponse({ status: 200, description: 'Usuario inactivado exitosamente' })
    @ApiResponse({ status: 403, description: 'No tienes permiso para inactivar este usuario' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    @Patch(':id/inactivate')
    async inactivateUser(
        @CurrentUser() user: tokenService.UserProfile, // ← Usuario autenticado
        @Param('id') id: number
    ) {
        const targetUserId = Number(id);

        // ✅ VALIDACIÓN: Usuario solo puede inactivar su propio perfil
        if (user.id !== targetUserId) {
            throw new ForbiddenException('No tienes permiso para inactivar el perfil de otro usuario');
        }

        return this.usersService.inactivateUser(targetUserId);
    }
}