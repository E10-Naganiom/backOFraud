import { IsString, IsNumber, IsOptional, IsEmail, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIncidentDto {
        @ApiProperty({ example: 'Robo en la calle', description: 'Titulo del incidente', required: true })
        @IsString()
        @IsOptional()
        titulo?: string;
        @ApiProperty({ example: 1, description: 'ID de la categoria del incidente', required: true })
        @IsNumber()
        @IsOptional()
        id_categoria?: number;
        @ApiProperty({ example: 'Juan Perez', description: 'Nombre del atacante/empresa fraudulenta', required: true })
        @IsString()
        @IsOptional()
        nombre_atacante?: string;
        @ApiProperty({ example: '555-1234', description: 'Medio de contacto telefónico', required: false })
        @IsString()
        @IsOptional()
        telefono?: string;
        @ApiProperty({ example: 'alexnachovc@gmail.com', description: 'Medio de contacto por correo electrónico', required: false })
        @IsEmail()
        @IsOptional()
        correo?: string;
        @ApiProperty({ example: '@alexnachovc', description: 'Medio de contacto por red social', required: false })
        @IsString()
        @IsOptional()
        user_red?: string;
        @ApiProperty({ example: 'Instagram', description: 'Plataforma social de contacto', required: false })
        @IsString()
        @IsOptional()
        red_social?: string;
        @ApiProperty({ example: 'El incidente ocurrió cuando...', description: 'Descripción detallada del incidente', required: true })
        @IsString()
        @IsOptional()
        descripcion?: string;
        @ApiProperty({ example: 1, description: 'ID del usuario que reporta el incidente', required: true })
        @IsNumber()
        @IsOptional()
        id_usuario?: number;
        @ApiProperty({ example: 1, description: 'ID del supervisor asignado al incidente si es que ya se evaluó', required: false })
        @IsNumber()
        @IsOptional()
        supervisor?: number;
        @ApiProperty({ example: 1, description: 'ID del estado del incidente', required: true })
        @IsNumber()
        @IsOptional()
        id_estatus?: number;
        @ApiProperty({ example: true, description: 'Indica si el reporte es anónimo', required: true })
        @IsBoolean()
        @IsOptional()
        es_anonimo?: boolean;
}