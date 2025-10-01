import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(
    join(__dirname, "..", "public"), { prefix: "/public/" }
  );
  const config = new DocumentBuilder().setTitle("Nuestra API")
  .setDescription("Ejemplo de documentación de un REST API en Swagger. Autores: Santiago Niño, Gabriel Gutiérrez, Omar Llano y Alejandro Vargas.")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, doc);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
function addBearerAuth() {
  throw new Error('Function not implemented.');
}

