import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ 
    example: 'Phishing', 
    description: 'Título de la categoría de incidente', 
    required: true 
  })
  @IsString()
  titulo: string;

  @ApiProperty({ 
    example: 'Intento de obtener información sensible mediante engaños', 
    description: 'Descripción detallada de la categoría', 
    required: true 
  })
  @IsString()
  descripcion: string;

  @ApiProperty({ 
    example: 3, 
    description: 'Nivel de riesgo (1: Bajo, 2: Medio, 3: Alto, 4: Crítico)', 
    required: true,
    minimum: 1,
    maximum: 4
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  id_riesgo: number;

  @ApiProperty({ 
    example: 'Correos con enlaces sospechosos, errores ortográficos, urgencia extrema', 
    description: 'Señales de alerta de este tipo de incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  senales?: string;

  @ApiProperty({ 
    example: 'Verificar remitente, no hacer clic en enlaces sospechosos', 
    description: 'Medidas de prevención', 
    required: false 
  })
  @IsString()
  @IsOptional()
  prevencion?: string;

  @ApiProperty({ 
    example: 'No responder, reportar como spam, cambiar contraseñas', 
    description: 'Acciones a tomar si ocurre el incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  acciones?: string;

  @ApiProperty({ 
    example: 'Correo falso de banco pidiendo actualizar datos', 
    description: 'Ejemplos de este tipo de incidente', 
    required: false 
  })
  @IsString()
  @IsOptional()
  ejemplos?: string;
}
