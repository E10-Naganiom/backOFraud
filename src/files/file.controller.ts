/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiResponse, ApiBody, ApiConsumes, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import * as tokenService from "src/auth/token.service";
import { diskStorage } from "multer";
import { join } from "path";
import { FilesService } from "./file.service";

@ApiBearerAuth() // ← TODOS los endpoints requieren autenticación
@Controller("files")
export class FileController {
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
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const name = file.originalname.replace(/\s/g, '_');
                const filename = `${uniqueSuffix}-${name}`;
                cb(null, filename);
            }
        })
    }))
    uploadFile(
        @CurrentUser() user: tokenService.UserProfile, // ← Usuario autenticado
        @UploadedFile() file: Express.Multer.File
    ) {
        this.filesService.validateFile(file);
        const fileInfo = this.filesService.getFileInfo(file);
        return {
            message: "Archivo subido exitosamente",
            uploaded_by: user.id, // ← Registrar quién subió el archivo
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
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const name = file.originalname.replace(/\s/g, '_');
                const filename = `${uniqueSuffix}-${name}`;
                cb(null, filename);
            }
        })
    }))
    uploadMultipleFiles(
        @CurrentUser() user: tokenService.UserProfile, // ← Usuario autenticado
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        this.filesService.validateMultipleFiles(files, 5);
        const filesInfo = this.filesService.getMultipleFilesInfo(files);
        return {
            message: `${files.length} archivo(s) subido(s) exitosamente`,
            uploaded_by: user.id, // ← Registrar quién subió los archivos
            user_email: user.email,
            files: filesInfo
        };
    }
}