/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentsRepository } from './incidents.repository';
import { DbModule } from '../db/db.module';
import { EvidenceModule } from '../evidences/evidence.module';
import { FilesModule } from '../files/file.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [DbModule,
            forwardRef(() => EvidenceModule), // ← Usar forwardRef
            FilesModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository],
  exports: [IncidentsService]
})
export class IncidentsModule {}