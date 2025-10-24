/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

export interface UploadedFileInfo {
  filename: string;
  url: string;
  relativePath: string;
}

@Injectable()
export class FilesService {
  private readonly uploadPath = join(__dirname, '../../public/uploads');
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB en bytes
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

  constructor() {
    // Asegurar que el directorio de uploads existe
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File): void {
    // Validar que file existe y es un objeto válido
    if (!file || typeof file !== 'object') {
      throw new BadRequestException('Archivo inválido o no proporcionado');
    }

    // Validar tamaño
    if (!file.size || typeof file.size !== 'number' || file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo ${file.originalname || 'desconocido'} excede el tamaño máximo permitido de 10MB`
      );
    }

    // Validar tipo MIME
    if (!file.mimetype || !this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype || 'desconocido'}. ` +
        `Tipos permitidos: imágenes (JPEG, PNG, GIF, WebP) y PDF`
      );
    }

    // Validar extensión
    if (!file.originalname || typeof file.originalname !== 'string') {
      throw new BadRequestException('Nombre de archivo inválido');
    }

    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Extensión de archivo no permitida: ${fileExtension}`
      );
    }
  }

  validateMultipleFiles(files: Express.Multer.File[], maxFiles: number = 5): void {
    // Validar que files sea un array
    if (!Array.isArray(files)) {
      throw new BadRequestException('Se esperaba un array de archivos');
    }

    // Validar que no esté vacío
    if (files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    // Validar cantidad máxima
    if (files.length > maxFiles) {
      throw new BadRequestException(
        `No se pueden subir más de ${maxFiles} archivos a la vez`
      );
    }

    // Validar cada archivo individualmente
    files.forEach((file, index) => {
      try {
        this.validateFile(file);
      } catch (error) {
        throw new BadRequestException(
          `Error en archivo ${index + 1}: ${error.message}`
        );
      }
    });
  }

  getFileInfo(file: Express.Multer.File): UploadedFileInfo {
    // Validar que file existe
    if (!file || !file.filename) {
      throw new BadRequestException('Información de archivo inválida');
    }

    const relativePath = `public/uploads/${file.filename}`;
    return {
      filename: file.filename,
      url: `http://localhost:3000/${relativePath}`,
      relativePath
    };
  }

  getMultipleFilesInfo(files: Express.Multer.File[]): UploadedFileInfo[] {
    // Validar que files sea un array
    if (!Array.isArray(files)) {
      throw new BadRequestException('Se esperaba un array de archivos');
    }

    return files.map((file, index) => {
      try {
        return this.getFileInfo(file);
      } catch (error) {
        throw new BadRequestException(
          `Error procesando archivo ${index + 1}: ${error.message}`
        );
      }
    });
  }

  deleteFile(relativePath: string): void {
    // Validar que relativePath es un string válido
    if (!relativePath || typeof relativePath !== 'string') {
      throw new BadRequestException('Ruta de archivo inválida');
    }

    // Prevenir path traversal attacks
    if (relativePath.includes('..') || relativePath.includes('~')) {
      throw new BadRequestException('Ruta de archivo no permitida');
    }

    try {
      const fullPath = join(__dirname, '../../', relativePath);
      
      // Asegurar que la ruta está dentro del directorio permitido
      if (!fullPath.startsWith(this.uploadPath)) {
        throw new BadRequestException('Acceso a archivo no permitido');
      }

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(`Error al eliminar archivo: ${error.message}`);
      throw new BadRequestException('Error al eliminar el archivo');
    }
  }
}