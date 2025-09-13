import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserAsAdminDto {
  @ApiProperty({ required: false, description: 'Email del usuario' })
  email?: string;

  @ApiProperty({ required: false, description: 'Nombre del usuario' })
  name?: string;

  @ApiProperty({ required: false, description: 'Contraseña del usuario' })
  password?: string;
}