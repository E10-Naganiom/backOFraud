/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    UsersModule,
    IncidentsModule,
    CategoriesModule  // ← AGREGAR para poder usar CategoriesService
  ],
  controllers: [AdminController],
})
export class AdminModule {}