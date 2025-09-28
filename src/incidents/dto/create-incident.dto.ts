import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateIncidentDto {
    @ApiProperty({ example: 'Robo en la calle', description: 'Titulo del incidente', required: true })
    @IsString()
    titulo: string;
    @ApiProperty({ example: 1, description: 'ID de la categoria del incidente', required: true })
    @IsNumber()
    id_categoria: number;
    @ApiProperty({ example: 'Juan Perez', description: 'Nombre del atacante/empresa fraudulenta', required: true })
    @IsString()
    nombre_atacante: string;
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
    user?: string;
    @ApiProperty({ example: 'Instagram', description: 'Plataforma social de contacto', required: false })
    @IsString()
    @IsOptional()
    red_social?: string;
    @ApiProperty({ example: 'El incidente ocurrió cuando...', description: 'Descripción detallada del incidente', required: true })
    @IsString()
    descripcion: string;
    @ApiProperty({ example: '28-09-2025', description: 'Fecha en la que ocurrió el incidente', required: true })
    @IsDateString()
    fecha_incidente: Date;
    @ApiProperty({ example: '28-09-2025', description: 'Fecha de levantamiento del reporte', required: true })
    @IsDateString()
    fecha_creacion: Date;
    @ApiProperty({ example: '28-09-2025', description: 'Fecha de actualizacion del reporte', required: true })
    @IsDateString()
    fecha_actualizacion: Date;
    @ApiProperty({ example: 1, description: 'ID del usuario que reporta el incidente', required: true })
    @IsNumber()
    id_usuario: number;
    @ApiProperty({ example: 1, description: 'ID del supervisor asignado al incidente si es que ya se evaluó', required: false })
    @IsNumber()
    @IsOptional()
    supervisor?: number;
    @ApiProperty({ example: 1, description: 'ID del estado del incidente', required: true })
    @IsNumber()
    id_status: number;
    @ApiProperty({ example: true, description: 'Indica si el reporte es anónimo', required: true })
    @IsBoolean()
    es_anonimo: boolean;
};