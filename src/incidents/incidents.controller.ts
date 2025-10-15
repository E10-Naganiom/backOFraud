/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Patch,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IncidentsService } from './incidents.service';
import { Incident } from './incidents.repository';
import { 
  ApiBody, 
  ApiOperation, 
  ApiResponse, 
  ApiTags,
  ApiConsumes,
  ApiBearerAuth
} from '@nestjs/swagger';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { UserProfile } from 'src/auth/token.service';
import { diskStorage } from 'multer';
import { join } from 'path';

@ApiTags('Modulo de Incidentes')
@ApiBearerAuth() // ← Indica en Swagger que todos los endpoints requieren Bearer token
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @ApiOperation({ summary: 'Crear un nuevo incidente con evidencias (máximo 5 archivos)' })
  @ApiResponse({ status: 201, description: 'Incidente creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o error en archivos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', example: 'Acoso en redes sociales' },
        id_categoria: { type: 'number', example: 1 },
        nombre_atacante: { type: 'string', example: 'Juan Pérez' },
        telefono: { type: 'string', example: '+1234567890' },
        correo: { type: 'string', example: 'ejemplo@mail.com' },
        user_red: { type: 'string', example: '@usuario123' },
        red_social: { type: 'string', example: 'Instagram' },
        descripcion: { type: 'string', example: 'Descripción del incidente' },
        supervisor: { type: 'number', example: 2 },
        es_anonimo: { type: 'boolean', example: false },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      },
      required: ['titulo', 'id_categoria', 'descripcion', 'es_anonimo']
    }
  })
  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: join(__dirname, '../../public/uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.originalname.replace(/\s/g, '_');
        const filename = `${uniqueSuffix}-${name}`;
        cb(null, filename);
      }
    })
  }))
  async createIncident(
    @CurrentUser() user: UserProfile, // ← NUEVO: Usuario del token
    @Body() createIncidentDto: CreateIncidentDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    return this.incidentsService.createIncident(
      user.id, // ← ID del usuario autenticado
      createIncidentDto, 
      files
    );
  }

  @ApiOperation({ summary: 'Obtener todos los incidentes con sus evidencias' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes obtenida exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get()
  async findAllIncidents() {
    return this.incidentsService.findAllIncidents();
  }

  @ApiOperation({ summary: 'Obtener un incidente en base a su ID con sus evidencias' })
  @ApiResponse({ status: 200, description: 'Incidente obtenido exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get(':id')
  async findOneIncident(
    @CurrentUser() user: UserProfile, // ← NUEVO: Validar que sea su incidente
    @Param('id') id: string
  ) {
    return this.incidentsService.findIncidentById(Number(id), user.id);
  }

  @ApiOperation({ 
    summary: 'Actualizar incidente: modificar datos, agregar nuevas evidencias y/o eliminar evidencias existentes' 
  })
  @ApiResponse({ status: 200, description: 'Incidente actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        id_categoria: { type: 'number' },
        nombre_atacante: { type: 'string' },
        telefono: { type: 'string' },
        correo: { type: 'string' },
        user_red: { type: 'string' },
        red_social: { type: 'string' },
        descripcion: { type: 'string' },
        supervisor: { type: 'number' },
        id_estatus: { type: 'number' },
        evidencias_a_eliminar: { 
          type: 'string',
          example: '1,2,3',
          description: 'IDs de evidencias a eliminar, separados por comas'
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: join(__dirname, '../../public/uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.originalname.replace(/\s/g, '_');
        const filename = `${uniqueSuffix}-${name}`;
        cb(null, filename);
      }
    })
  }))
  async updateIncident(
    @CurrentUser() user: UserProfile, // ← NUEVO: Validar que sea su incidente
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const { evidencias_a_eliminar, ...data } = updateIncidentDto;
    
    // Convertir string de IDs a array de números si viene como string
    let idsToDelete: number[] | undefined;
    if (evidencias_a_eliminar) {
      idsToDelete = evidencias_a_eliminar;
    }

    return this.incidentsService.updateIncident(
      Number(id),
      user.id, // ← ID del usuario autenticado
      data,
      files,
      idsToDelete
    );
  }

  @ApiOperation({ summary: 'Eliminar un incidente (soft delete - cambio a estatus 3)' })
  @ApiResponse({ status: 200, description: 'Incidente eliminado exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Patch(':id/delete')
  async deleteIncident(
    @CurrentUser() user: UserProfile, // ← NUEVO: Validar que sea su incidente
    @Param('id') id: number
  ) {
    return this.incidentsService.deleteIncident(Number(id), user.id);
  }

  @ApiOperation({ summary: 'Obtener los incidentes de cierto usuario en base a su ID' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes del usuario obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get('user/:id')
  async findIncidentsByUserId(@Param('id') id: number) {
    return this.incidentsService.findIncidentsByUserId(Number(id));
  }
}