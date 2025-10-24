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
  UseInterceptors,
  ForbiddenException,
  BadRequestException
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
import * as tokenService from 'src/auth/token.service';
import { diskStorage } from 'multer';
import { join, extname } from 'path';

@ApiTags('Modulo de Incidentes')
@ApiBearerAuth()
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
        // Sanitizar nombre de archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname).toLowerCase();
        const nameWithoutExt = file.originalname
          .replace(ext, '')
          .replace(/[^a-zA-Z0-9]/g, '_') // Remover caracteres especiales
          .substring(0, 50); // Limitar longitud
        const filename = `${uniqueSuffix}-${nameWithoutExt}${ext}`;
        cb(null, filename);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB por archivo
      files: 5 // Máximo 5 archivos
    },
    fileFilter: (req, file, cb) => {
      // Validar tipo MIME
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            `Tipo de archivo no permitido: ${file.mimetype}. ` +
            `Solo se permiten: imágenes (JPEG, PNG, GIF, WebP) y PDF`
          ),
          false
        );
      }

      // Validar extensión
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
      const ext = extname(file.originalname).toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        return cb(
          new BadRequestException(
            `Extensión no permitida: ${ext}. ` +
            `Solo se permiten: ${allowedExtensions.join(', ')}`
          ),
          false
        );
      }

      cb(null, true);
    }
  }))
  async createIncident(
    @CurrentUser() user: tokenService.UserProfile,
    @Body() createIncidentDto: CreateIncidentDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    // Validar que files sea un array si existe
    if (files && !Array.isArray(files)) {
      throw new BadRequestException('Se esperaba un array de archivos');
    }

    // Transformar es_anonimo correctamente
    const es_anonimo = createIncidentDto.es_anonimo === true || 
                        createIncidentDto.es_anonimo === 'true' || 
                        createIncidentDto.es_anonimo === '1' ||
                        (createIncidentDto.es_anonimo as any) === 1;

    // Crear el DTO corregido
    const correctedDto = {
      ...createIncidentDto,
      es_anonimo
    };

    return this.incidentsService.createIncident(
      user.id,
      correctedDto,
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

  // ========================================================================
  // RUTAS ESPECÍFICAS - DEBEN IR ANTES DE :id
  // ========================================================================

  @ApiOperation({ summary: 'Obtener los incidentes más recientes globales (últimos 5)' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes recientes obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron incidentes recientes.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get('recent/incidents')
  async findRecentIncidents(
    @CurrentUser() user: tokenService.UserProfile
  ) {
    return this.incidentsService.findRecentIncidents();
  }

  @ApiOperation({ summary: 'Obtener estadísticas globales de incidentes' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron datos para las estadísticas.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get('statistics/summary')
  async getIncidentStatistics() {
    return this.incidentsService.getIncidentStatistics();
  }

  @ApiOperation({ summary: 'Obtener los incidentes de cierto usuario en base a su ID' })
  @ApiResponse({ status: 200, description: 'Lista de incidentes del usuario obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get('user/:id')
  async findIncidentsByUserId(@Param('id') id: number) {
    return this.incidentsService.findIncidentsByUserId(Number(id));
  }

  // ========================================================================
  // RUTAS CON :id - DEBEN IR AL FINAL
  // ========================================================================

  @ApiOperation({ summary: 'Obtener un incidente en base a su ID con sus evidencias' })
  @ApiResponse({ status: 200, description: 'Incidente obtenido exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get(':id')
  async findOneIncident(
    @CurrentUser() user: tokenService.UserProfile,
    @Param('id') id: string
  ) {
    return this.incidentsService.findIncidentById(Number(id), user.id);
  }

  @ApiOperation({ summary: 'Obtener estatus de un incidente dado su ID' })
  @ApiResponse({ status: 200, description: 'Estatus del incidente obtenido exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get(':id/status')
  async getIncidentStatus(
    @CurrentUser() user: tokenService.UserProfile,
    @Param('id') id: number
  ) {
    return this.incidentsService.getIncidentStatus(Number(id), user.id);
  }

  @ApiOperation({ summary: 'Obtener el nombre de usuario asociado a un incidente en base a su ID' })
  @ApiResponse({ status: 200, description: 'Nombre de usuario obtenido exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver este incidente.' })
  @ApiResponse({ status: 404, description: 'Incidente no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get(':id/username')
  async getIncidentUsername(
    @CurrentUser() user: tokenService.UserProfile,
    @Param('id') id: number
  ) {
    return this.incidentsService.getIncidentUsername(Number(id), user.id);
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
        // Sanitizar nombre de archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname).toLowerCase();
        const nameWithoutExt = file.originalname
          .replace(ext, '')
          .replace(/[^a-zA-Z0-9]/g, '_') // Remover caracteres especiales
          .substring(0, 50); // Limitar longitud
        const filename = `${uniqueSuffix}-${nameWithoutExt}${ext}`;
        cb(null, filename);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB por archivo
      files: 5 // Máximo 5 archivos
    },
    fileFilter: (req, file, cb) => {
      // Validar tipo MIME
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            `Tipo de archivo no permitido: ${file.mimetype}. ` +
            `Solo se permiten: imágenes (JPEG, PNG, GIF, WebP) y PDF`
          ),
          false
        );
      }

      // Validar extensión
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
      const ext = extname(file.originalname).toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        return cb(
          new BadRequestException(
            `Extensión no permitida: ${ext}. ` +
            `Solo se permiten: ${allowedExtensions.join(', ')}`
          ),
          false
        );
      }

      cb(null, true);
    }
  }))
  async updateIncident(
    @CurrentUser() user: tokenService.UserProfile,
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    // Validar que files sea un array si existe
    if (files && !Array.isArray(files)) {
      throw new BadRequestException('Se esperaba un array de archivos');
    }

    const { evidencias_a_eliminar, ...data } = updateIncidentDto;
    
    let idsToDelete: number[] | undefined;
    if (evidencias_a_eliminar) {
      idsToDelete = evidencias_a_eliminar;
    }

    return this.incidentsService.updateIncident(
      Number(id),
      user.id,
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
    @CurrentUser() user: tokenService.UserProfile,
    @Param('id') id: number
  ) {
    return this.incidentsService.deleteIncident(Number(id), user.id);
  }

  @ApiOperation({ summary: 'Obtener resumen de incidentes del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Resumen del usuario obtenido exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver este resumen.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @Get('user/:id/summary')
  async getUserIncidentSummary(
    @CurrentUser() user: tokenService.UserProfile,
    @Param('id') id: number
  ) {
    const targetUserId = Number(id);

    // VALIDACIÓN: Usuario solo puede ver su propio resumen
    if (user.id !== targetUserId) {
      throw new ForbiddenException('No tienes permiso para ver el resumen de otro usuario');
    }

    return this.incidentsService.getUserIncidentSummary(targetUserId);
  }
}