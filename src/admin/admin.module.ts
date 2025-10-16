import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { IncidentsModule } from 'src/incidents/incidents.module';

@Module({
  imports: [UsersModule, IncidentsModule], 
  controllers: [AdminController]
})
export class AdminModule {}
