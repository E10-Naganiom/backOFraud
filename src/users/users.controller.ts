import { Controller, Post } from "@nestjs/common";
import { Body, Get, Param, Put } from "@nestjs/common/decorators";
import { UsersService } from "./users.service";
import { ApiBody, ApiOperation, ApiProperty, ApiPropertyOptional, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";
import { CreateUserDto } from "./dto/create-user-dto";
import { UpdateUserDto } from "./dto/update-user-dto";


@ApiTags('Modulo de Usuarios')
@Controller('users')
export class UsersController{
    constructor(private readonly usersService:UsersService){}

    @ApiOperation({summary: "Endpoint para registro de usuarios"})
    @ApiResponse({status: 202, description: 'Usuario creado exitosamente'})
    @ApiResponse({status: 402, description: 'Error en los datos proporcionados'})
    @Post()
    async createUser(@Body() creayeUserDto:CreateUserDto){
        return this.usersService.createUser(creayeUserDto.email, creayeUserDto.name, creayeUserDto.apellido, creayeUserDto.password);
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