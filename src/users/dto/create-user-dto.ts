import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";


export class CreateUserDto {
    @ApiProperty({ example: 'Juan', description: 'Nombre del usuario', required: true})
    @IsString()
    name: string;
    @ApiProperty({ example: 'Niño', description: 'Apellido del usuario', required: true})
    @IsString()
    apellido: string;
    @ApiProperty({ example: 'juan@example', description: 'Correo unico para el usuario', required: true})
    @IsEmail()
    email: string;
    @ApiProperty({ example: 'password123', description: 'Contraseña en texto plano', required: true})
    @IsString()
    password: string;
    @ApiPropertyOptional({ example: false, description: 'Indica si es administrador', required: false }) 
    @IsBoolean() 
    @IsOptional()
    is_admin: boolean; 
    @ApiPropertyOptional({ example: true, description: 'Indica si la cuenta está activa', required: false })
    @IsBoolean() 
    @IsOptional()
    is_active: boolean;
};