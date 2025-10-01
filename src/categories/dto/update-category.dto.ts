import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ 
    example: 'Phishing Avanzado', 
    description: 'Título de la categoría de incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ 
    example: 'Técnicas sofisticadas de suplantación de identidad', 
    description: 'Descripción detallada de la categoría', 
    required: false 
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ 
    example: 4, 
    description: 'Nivel de riesgo (1: Bajo, 2: Medio, 3: Alto, 4: Crítico)', 
    required: false,
    minimum: 1,
    maximum: 4
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  id_riesgo?: number;

  @ApiProperty({ 
    example: 'Correos altamente personalizados, dominios similares al original', 
    description: 'Señales de alerta de este tipo de incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  senales?: string;

  @ApiProperty({ 
    example: 'Capacitación continua, verificación en dos pasos', 
    description: 'Medidas de prevención', 
    required: false 
  })
  @IsString()
  @IsOptional()
  prevencion?: string;

  @ApiProperty({ 
    example: 'Contactar al equipo de seguridad inmediatamente', 
    description: 'Acciones a tomar si ocurre el incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  acciones?: string;

  @ApiProperty({ 
    example: 'Spear phishing dirigido a ejecutivos', 
    description: 'Ejemplos de este tipo de incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  ejemplos?: string;
}
