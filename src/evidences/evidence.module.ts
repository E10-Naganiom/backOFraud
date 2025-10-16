/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { EvidenceRepository } from './evidence.repository';
import { DbModule } from '../db/db.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { forwardRef } from '@nestjs/common';


@Module({
  imports: [
    DbModule,
    forwardRef(() => IncidentsModule) // ← Usar forwardRef
  ],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceRepository],
  exports: [EvidenceService]
})
export class EvidenceModule {}