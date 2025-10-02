/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { EvidenceRepository } from './evidence.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceRepository],
  exports: [EvidenceService]
})
export class EvidenceModule {}