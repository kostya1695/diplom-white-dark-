import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Approval } from './approval.entity';
import { AuditLog } from './audit-log.entity';
import { DocumentEvent } from './document-event.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { FilesController } from './files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Approval, AuditLog, DocumentEvent])],
  providers: [DocumentsService],
  controllers: [DocumentsController, FilesController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
