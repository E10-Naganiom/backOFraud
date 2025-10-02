import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiAcceptedResponse, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { join } from "path";



@Controller("files")
export class FileController {
    @ApiOperation({ summary: "Subir un archivo" })
    @ApiResponse({ status: 201, description: "Archivo subido exitosamente." })
    @ApiResponse({ status: 400, description: "Error al subir el archivo." })
    @ApiConsumes("multipart/form-data") // 👈 NECESARIO para swagger
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary", // 👈 Esto le dice a Swagger que es un archivo
                },
            },
        },
    })
    @Post("upload")
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: join(__dirname, "../../public/uploads"),
            filename: (req, file, cb) => {
                const name = file.originalname.replace(" ", "");
                cb(null, name);
            }
        })
    }))

    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return { fileKey: ` ${file.filename}`,
            url: `http://localhost:3000/public/uploads/${file.filename}` };
    }
}