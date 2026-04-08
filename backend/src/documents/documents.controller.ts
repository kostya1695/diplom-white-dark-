import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApproveDocumentDto,
  AssignOwnerDto,
  RejectDocumentDto,
  TransitionDto,
  UploadDocumentDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly docsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.docsService.upload(file, dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KAFEDRA, UserRole.DEKANAT, UserRole.STUDENT)
  @Get()
  list(@Request() req: { user: { sub: string; role: UserRole } }) {
    return this.docsService.listForUser(req.user);
  }

  /** Публично: сведения о документе по ID (без JWT) */
  @Get('public/:documentId')
  getPublic(@Param('documentId') documentId: string) {
    return this.docsService.getPublicByDocumentId(documentId);
  }

  /** Публично: проверка только по загруженному PDF (поиск записи по хэшу) */
  @Post('verify-file')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  verifyByFile(@UploadedFile() file: Express.Multer.File) {
    return this.docsService.verifyByUploadedFile(file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KAFEDRA, UserRole.DEKANAT, UserRole.STUDENT)
  @Get(':documentId')
  getOne(
    @Param('documentId') documentId: string,
    @Request() req: { user: { sub: string; role: UserRole } },
  ) {
    return this.docsService.getByDocumentId(documentId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KAFEDRA, UserRole.DEKANAT)
  @Post(':documentId/approve')
  approve(
    @Param('documentId') documentId: string,
    @Body() dto: ApproveDocumentDto,
    @Request() req: { user: { sub: string; fullName: string; email: string; role: UserRole } },
  ) {
    return this.docsService.approve(documentId, req.user, dto.comment);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.KAFEDRA, UserRole.DEKANAT)
  @Post(':documentId/reject')
  reject(
    @Param('documentId') documentId: string,
    @Body() dto: RejectDocumentDto,
    @Request() req: { user: { sub: string; fullName: string; email: string; role: UserRole } },
  ) {
    return this.docsService.reject(documentId, req.user, dto.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.KAFEDRA, UserRole.DEKANAT, UserRole.STUDENT)
  @Get(':documentId/events')
  events(
    @Param('documentId') documentId: string,
    @Request() req: { user: { sub: string; role: UserRole } },
  ) {
    return this.docsService.events(documentId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':documentId/register')
  registerOnChain(
    @Param('documentId') documentId: string,
    @Request() req: { user: { sub: string; fullName: string } },
  ) {
    void req;
    return this.docsService.registerOnChain(documentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':documentId/assign-owner')
  assignOwner(
    @Param('documentId') documentId: string,
    @Body() dto: AssignOwnerDto,
    @Request() req: { user: { sub: string; fullName: string } },
  ) {
    return this.docsService.assignOwner(documentId, dto.walletAddress, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':documentId/transition')
  transition(
    @Param('documentId') documentId: string,
    @Body() dto: TransitionDto,
    @Request() req: { user: { sub: string; fullName: string } },
  ) {
    return this.docsService.transition(documentId, dto.toStatus, req.user, dto.comment);
  }

  @Post(':documentId/verify')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  verify(
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.docsService.verify(documentId, file);
  }
}
