import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { ApproveDocumentDto, AssignOwnerDto, RejectDocumentDto } from './dto';

/** Алиас маршрутов `/api/files/...` (как в ТЗ FastAPI); логика та же, что у `/api/documents/...`. */
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly docsService: DocumentsService) {}

  @Roles(UserRole.ADMIN, UserRole.KAFEDRA, UserRole.DEKANAT, UserRole.STUDENT)
  @Get(':id')
  getOne(@Param('id') id: string, @Request() req: { user: { sub: string; role: UserRole } }) {
    return this.docsService.getByDocumentId(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.KAFEDRA, UserRole.DEKANAT)
  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveDocumentDto,
    @Request() req: { user: { sub: string; fullName: string; email: string; role: UserRole } },
  ) {
    return this.docsService.approve(id, req.user, dto.comment);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.KAFEDRA, UserRole.DEKANAT)
  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectDocumentDto,
    @Request() req: { user: { sub: string; fullName: string; email: string; role: UserRole } },
  ) {
    return this.docsService.reject(id, req.user, dto.reason);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/register')
  register(@Param('id') id: string) {
    return this.docsService.registerOnChain(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/assign-owner')
  assignOwner(
    @Param('id') id: string,
    @Body() dto: AssignOwnerDto,
    @Request() req: { user: { sub: string; fullName: string } },
  ) {
    return this.docsService.assignOwner(id, dto.walletAddress, req.user);
  }
}
