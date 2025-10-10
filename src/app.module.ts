/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { DbModule } from './db/db.module';
import { EvidenceModule } from './evidences/evidence.module';
import { FilesModule } from './files/file.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    UsersModule,
    IncidentsModule,
    CategoriesModule,
    AdminModule,
    EvidenceModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // ← Guard aplicado globalmente a TODOS los endpoints
    },
  ],
})
export class AppModule {}