import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Matches, Max, Min } from 'class-validator';
import { DocumentStatus } from '../common/enums';

export class UploadDocumentDto {
  @IsNotEmpty()
  studentFullName!: string;

  @IsNotEmpty()
  studentCode!: string;

  @IsNotEmpty()
  specialty!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;
}

export class TransitionDto {
  @IsEnum(DocumentStatus)
  toStatus!: DocumentStatus;

  @IsOptional()
  comment?: string;
}

export class ApproveDocumentDto {
  @IsOptional()
  comment?: string;
}

export class RejectDocumentDto {
  @IsOptional()
  reason?: string;
}

export class VerifyDto {
  @IsNotEmpty()
  documentId!: string;
}

export class AssignOwnerDto {
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Некорректный адрес Ethereum' })
  walletAddress!: string;
}
