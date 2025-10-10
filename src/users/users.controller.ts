/* eslint-disable prettier/prettier */
import { Controller, Post } from "@nestjs/common";
import { Body, Get, Param, Put, Patch } from "@nestjs/common/decorators";
import { UsersService } from "./users.service";
import { Public } from "src/common/decorators/public.decorator"; // ← NUEVO
import { ApiBody, ApiOperation, ApiPropertyOptional, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user-dto";
import { UpdateUserDto } from "./dto/update-user-dto";


@ApiTags('Modulo de Usuarios')
@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    @Public() // ← NUEVO: Endpoint público (sin autenticación)
    @ApiOperation({summary: "Endpoint para registro de usuarios"})
    @ApiResponse({status: 202, description: 'Usuario creado exitosamente'})
    @ApiResponse({status: 402, description: 'Error en los datos proporcionados'})
    @Post()
    async createUser(@Body() createUserDto:CreateUserDto){
        return this.usersService.createUser(createUserDto.email, createUserDto.name, createUserDto.apellido, createUserDto.password);
    }

    @ApiOperation({summary: "Endpoint para actualizar usuarios por su ID"})
    @ApiResponse({status: 200, description: 'Usuario actualizado exitosamente'})
    @ApiResponse({status: 403, description: 'Usuario no encontrado'})
    @ApiBody({type: UpdateUserDto})
    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto:UpdateUserDto){
        return this.usersService.updateUser(Number(id), updateUserDto);
    }

    @ApiOperation({ summary: "Endpoint para inactivar un usuario por su ID" })
    @ApiResponse({ status: 200, description: 'Usuario inactivado exitosamente' })
    @ApiResponse({ status: 403, description: 'Usuario no encontrado' })
    @Patch(':id/inactivate')
    async inactivateUser(@Param('id') id: number) {
        return this.usersService.inactivateUser(Number(id));
    }
}