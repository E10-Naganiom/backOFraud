/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiResponse, ApiBody, ApiConsumes, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import * as tokenService from "src/auth/token.service";
import { diskStorage } from "multer";
import { join, extname } from "path";
import { FilesService } from "./file.service";

@ApiBearerAuth()
@Controller("files")
export class FileController {
    // Configuración de límites
    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
    ];

    constructor(private readonly filesService: FilesService) {}

    @ApiOperation({ summary: "Subir un archivo" })
    @ApiResponse({ status: 201, description: "Archivo subido exitosamente." })
    @ApiResponse({ status: 400, description: "Error al subir el archivo." })
    @ApiResponse({ status: 401, description: "No autenticado." })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    @Post("upload")
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: join(__dirname, "../../public/uploads"),
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
            fileSize: 10 * 1024 * 1024, // 10MB límite
            files: 1 // Solo 1 archivo en este endpoint
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
                        `Solo se permiten: ${allowedMimeTypes.join(', ')}`
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
    uploadFile(
        @CurrentUser() user: tokenService.UserProfile,
        @UploadedFile() file: Express.Multer.File
    ) {
        // Validación adicional del servicio
        this.filesService.validateFile(file);
        const fileInfo = this.filesService.getFileInfo(file);
        
        return {
            message: "Archivo subido exitosamente",
            uploaded_by: user.id,
            user_email: user.email,
            ...fileInfo
        };
    }

    @ApiOperation({ summary: "Subir múltiples archivos (máximo 5)" })
    @ApiResponse({ status: 201, description: "Archivos subidos exitosamente." })
    @ApiResponse({ status: 400, description: "Error al subir los archivos." })
    @ApiResponse({ status: 401, description: "No autenticado." })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                files: {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary",
                    },
                },
            },
        },
    })
    @Post("upload-multiple")
    @UseInterceptors(FilesInterceptor("files", 5, {
        storage: diskStorage({
            destination: join(__dirname, "../../public/uploads"),
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
                        `Tipo de archivo no permitido: ${file.mimetype}`
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
                        `Extensión no permitida: ${ext}`
                    ),
                    false
                );
            }

            cb(null, true);
        }
    }))
    uploadMultipleFiles(
        @CurrentUser() user: tokenService.UserProfile,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        // Validación adicional del servicio
        this.filesService.validateMultipleFiles(files, 5);
        const filesInfo = this.filesService.getMultipleFilesInfo(files);
        
        return {
            message: `${files.length} archivo(s) subido(s) exitosamente`,
            uploaded_by: user.id,
            user_email: user.email,
            files: filesInfo
        };
    }
}