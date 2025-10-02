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
    // Validar tamaño
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo ${file.originalname} excede el tamaño máximo permitido de 10MB`
      );
    }

    // Validar tipo MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. ` +
        `Tipos permitidos: imágenes (JPEG, PNG, GIF, WebP) y PDF`
      );
    }

    // Validar extensión
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Extensión de archivo no permitida: ${fileExtension}`
      );
    }
  }

  validateMultipleFiles(files: Express.Multer.File[], maxFiles: number = 5): void {
    if (files.length > maxFiles) {
      throw new BadRequestException(
        `No se pueden subir más de ${maxFiles} archivos a la vez`
      );
    }

    files.forEach(file => this.validateFile(file));
  }

  getFileInfo(file: Express.Multer.File): UploadedFileInfo {
    const relativePath = `public/uploads/${file.filename}`;
    return {
      filename: file.filename,
      url: `http://localhost:3000/${relativePath}`,
      relativePath
    };
  }

  getMultipleFilesInfo(files: Express.Multer.File[]): UploadedFileInfo[] {
    return files.map(file => this.getFileInfo(file));
  }

  deleteFile(relativePath: string): void {
    try {
      const fullPath = join(__dirname, '../../', relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(`Error al eliminar archivo: ${error.message}`);
      throw new BadRequestException('Error al eliminar el archivo');
    }
  }
}