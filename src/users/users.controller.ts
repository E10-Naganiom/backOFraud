import { Controller, Post } from "@nestjs/common";
import { Body, Get, Param, Put } from "@nestjs/common/decorators";
import { UsersService } from "./users.service";
import { ApiBody, ApiOperation, ApiProperty, ApiPropertyOptional, ApiResponse, ApiTags } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: 'juan@example', description: 'Correo unico para el usuario', required: true})
    email: string;
    @ApiProperty({ example: 'Juan Perez', description: 'Nombre del usuario', required: true})
    name: string;
    @ApiProperty({ example: 'password123', description: 'Contraseña en texto plano', required: true})
    password: string;
};

export class UpdateUserDto  {
    @ApiPropertyOptional({ example: 'juana@example', description: 'Nuevo correo (opcional)', required: false})
    email?:string;
    @ApiPropertyOptional({ example: 'Juana Lopez', description: 'Nuevo nombre (opcional)', required: false})
    name?:string;
    @ApiPropertyOptional({ example: 'password123', description: 'Nueva contraseña en texto plano (opcional)', required: false})
    password?:string;
}

@ApiTags('Modulo de Usuarios')
@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    @ApiOperation({summary: "Endpoint para registro de usuarios"})
    @ApiResponse({status: 202, description: 'Usuario creado exitosamente'})
    @ApiResponse({status: 402, description: 'Error en los datos proporcionados'})
    @Post()
    async createUser(@Body() creayeUserDto:CreateUserDto){
        return this.usersService.createUser(creayeUserDto.email, creayeUserDto.name, creayeUserDto.password);
    }

    @ApiOperation({summary: "Endpoint para actualizar usuarios por su ID"})
    @ApiResponse({status: 200, description: 'Usuario actualizado exitosamente'})
    @ApiResponse({status: 403, description: 'Usuario no encontrado'})
    @ApiBody({type: UpdateUserDto})
    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto:UpdateUserDto){
        return this.usersService.updateUser(Number(id), updateUserDto);
    }
}