import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateIncidentDto {
    @IsString()
    titulo: string;

    @IsNumber()
    id_categoria: number;

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
    id_usuario?: number;

    @IsNumber()
    id_status: number;

    @IsBoolean()
    is_anonym: boolean;
}