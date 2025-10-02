/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiResponse, ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { join } from "path";
import { FilesService } from "./file.service";

@Controller("files")
export class FileController {
    constructor(private readonly filesService: FilesService) {}

    @ApiOperation({ summary: "Subir un archivo" })
    @ApiResponse({ status: 201, description: "Archivo subido exitosamente." })
    @ApiResponse({ status: 400, description: "Error al subir el archivo." })
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
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        this.filesService.validateFile(file);
        const fileInfo = this.filesService.getFileInfo(file);
        return {
            message: "Archivo subido exitosamente",
            ...fileInfo
        };
    }

    @ApiOperation({ summary: "Subir múltiples archivos (máximo 5)" })
    @ApiResponse({ status: 201, description: "Archivos subidos exitosamente." })
    @ApiResponse({ status: 400, description: "Error al subir los archivos." })
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
    uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
        this.filesService.validateMultipleFiles(files, 5);
        const filesInfo = this.filesService.getMultipleFilesInfo(files);
        return {
            message: `${files.length} archivo(s) subido(s) exitosamente`,
            files: filesInfo
        };
    }
}