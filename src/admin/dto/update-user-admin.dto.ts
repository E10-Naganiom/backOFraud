import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserAsAdminDto {
  @ApiProperty({ example: 'nuevo@example.com', required: false, description: 'Nuevo Email del usuario (opcional)' })
  email?: string;

  @ApiProperty({ example: 'Sara Gil', required: false, description: 'Nuevo Nombre del usuario (opcional)' })
  name?: string;

  @ApiProperty({ example: 'newPass123', required: false, description: 'Nueva contraseña en texto plano (opcional)' })
  password?: string;
}