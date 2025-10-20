import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ========================================================================
  // HABILITAR CORS - CRÍTICO PARA DASHBOARD
  // ========================================================================
  app.enableCors({
    origin: [
      'http://localhost:3000',      // Next.js dev server
      'http://localhost:3001',      // Alternativa
      'http://127.0.0.1:3000',      // Localhost alternativo
      'http://10.48.238.60:3000',   // IP del servidor si es necesario
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ========================================================================
  // CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
  // ========================================================================
  app.useStaticAssets(
    join(__dirname, "..", "public"), 
    { prefix: "/public/" }
  );

  // ========================================================================
  // CONFIGURACIÓN DE SWAGGER
  // ========================================================================
  const config = new DocumentBuilder()
    .setTitle("Nuestra API")
    .setDescription("Ejemplo de documentación de un REST API en Swagger. Autores: Santiago Niño, Gabriel Gutiérrez, Omar Llano y Alejandro Vargas.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, doc);

  // ========================================================================
  // INICIAR SERVIDOR
  // ========================================================================
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
}

bootstrap();