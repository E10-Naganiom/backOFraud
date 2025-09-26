import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentsRepository } from './incidents.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository],
  exports: [IncidentsService]
})
export class IncidentsModule {}