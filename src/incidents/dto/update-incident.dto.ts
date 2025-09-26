import { IsString, IsNumber, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class UpdateIncidentDto {
    @IsOptional()
    @IsString()
    titulo?: string;

    @IsOptional()
    @IsNumber()
    id_categoria?: number;

    @IsOptional()
    @IsString()
    nombre_atacante?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsEmail()
    correo?: string;

    @IsOptional()
    @IsString()
    user?: string;

    @IsOptional()
    @IsString()
    red_social?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsDateString()
    fecha_incidente?: string;

    @IsOptional()
    @IsNumber()
    superviser?: number;

    @IsOptional()
    @IsNumber()
    id_status?: number;
}