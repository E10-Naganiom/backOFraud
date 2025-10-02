/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FilesService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}