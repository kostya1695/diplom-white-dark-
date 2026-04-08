import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { AuditLog } from './audit-log.entity';
import { Approval } from './approval.entity';
import { DocumentStatus } from '../common/enums';
import { randomUUID, createHash } from 'crypto';
import { Client as MinioClient } from 'minio';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { DocumentEvent } from './document-event.entity';
import { UserRole } from '../common/enums';

type JwtUser = { sub: string; fullName: string; email?: string; role?: UserRole };

@Injectable()
export class DocumentsService {
  private readonly minio: MinioClient;
  private readonly bucket: string;
  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly contract: ethers.Contract | null;

  constructor(
    @InjectRepository(Document) private readonly docsRepo: Repository<Document>,
    @InjectRepository(Approval) private readonly approvalsRepo: Repository<Approval>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(DocumentEvent) private readonly eventsRepo: Repository<DocumentEvent>,
    private readonly config: ConfigService,
  ) {
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'diplomas');
    this.minio = new MinioClient({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'minio'),
      port: Number(this.config.get<string>('MINIO_PORT', '9000')),
      useSSL: false,
      accessKey: this.config.get<string>('MINIO_ROOT_USER', 'minioadmin'),
      secretKey: this.config.get<string>('MINIO_ROOT_PASSWORD', 'minioadmin'),
    });

    this.provider = new ethers.JsonRpcProvider(
      this.config.get<string>('BLOCKCHAIN_RPC_URL', 'http://blockchain:8545'),
    );
    this.wallet = new ethers.Wallet(
      this.config.get<string>(
        'BLOCKCHAIN_PRIVATE_KEY',
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      ),
      this.provider,
    );
    const abi = [
      'function logEvent(string documentId, bytes32 hash, uint8 status)',
      'function registerDocument(string documentId, bytes32 hash, address universityAddress)',
      'function verifyDocument(string documentId, bytes32 hash) view returns (bool)',
      'function emitActionEvent(string documentId, string actionType)',
    ];
    const addr = (this.config.get<string>('BLOCKCHAIN_CONTRACT_ADDRESS', '') || '').trim();
    this.contract =
      addr && ethers.isAddress(addr) ? new ethers.Contract(addr, abi, this.wallet) : null;
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async aiCheck(documentId: string) {
    const warnings = ['Форматирование титульного листа требует проверки человеком'];
    const errors: string[] = [];
    const status = errors.length ? 'FAILED' : 'PASSED';
    await this.auditRepo.save({ documentId, errors, warnings, status });
    return { errors, warnings, status };
  }

  async upload(
    file: Express.Multer.File,
    payload: {
      studentFullName: string;
      studentCode: string;
      specialty: string;
      year: number;
    },
    uploadedByUserId: string,
  ) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Разрешены только PDF файлы');
    }
    await this.ensureBucket();
    const documentId = randomUUID();
    const hashSha256 = createHash('sha256').update(file.buffer).digest('hex');
    const objectKey = `${documentId}.pdf`;
    await this.minio.putObject(this.bucket, objectKey, file.buffer, file.size, {
      'Content-Type': 'application/pdf',
    });

    const now = new Date().toISOString();
    const doc = this.docsRepo.create({
      documentId,
      createdByUserId: uploadedByUserId,
      ...payload,
      minioObjectKey: objectKey,
      minioBucket: this.bucket,
      hashSha256,
      status: DocumentStatus.PENDING,
      currentStage: 1,
      stageHistory: [
        {
          stage: 1,
          action: 'FIXATION',
          actor: payload.studentFullName,
          timestamp: now,
        },
      ],
      aiCheckStatus: 'pending',
      blockchainEvents: [],
    });
    let saved = await this.docsRepo.save(doc);
    await this.createEvent(saved, 'UPLOADED', { actorWallet: this.wallet.address });
    await this.appendChainFromTx(
      saved,
      await this.emitActionEventChain(documentId, 'FIXATION'),
      'emitAction:FIXATION',
      this.wallet.address,
    );

    await this.aiCheck(documentId);
    saved.aiCheckStatus = 'passed';
    saved = await this.docsRepo.save(saved);
    return this.toResponse(saved);
  }

  async listForUser(user: { sub: string; role: UserRole }) {
    const allRoles = [UserRole.ADMIN, UserRole.KAFEDRA, UserRole.DEKANAT];
    const rows = await this.docsRepo.find({
      where: allRoles.includes(user.role) ? {} : { createdByUserId: user.sub },
      order: { createdAt: 'DESC' },
    });
    return rows.map((d) => this.toResponse(d));
  }

  async getByDocumentId(documentId: string, user?: { sub: string; role: UserRole }) {
    const doc = await this.docsRepo.findOne({ where: { documentId } });
    if (!doc) throw new NotFoundException('Документ не найден');
    if (user && user.role === UserRole.STUDENT && doc.createdByUserId !== user.sub) {
      throw new NotFoundException('Документ не найден');
    }
    return this.toResponse(doc);
  }

  async approve(documentId: string, user: JwtUser, comment?: string) {
    const doc = await this.requireDoc(documentId);
    let nextStatus: DocumentStatus | null = null;
    if (user.role === UserRole.KAFEDRA && doc.status === DocumentStatus.PENDING) {
      nextStatus = DocumentStatus.KAFEDRA_APPROVED;
    }
    if (user.role === UserRole.DEKANAT && doc.status === DocumentStatus.KAFEDRA_APPROVED) {
      nextStatus = DocumentStatus.DEKANAT_APPROVED;
    }
    if (!nextStatus) {
      throw new BadRequestException('Недопустимый этап согласования для вашей роли');
    }
    doc.status = nextStatus;
    if (nextStatus === DocumentStatus.KAFEDRA_APPROVED) {
      doc.departmentApprovedAt = new Date();
    }
    if (nextStatus === DocumentStatus.DEKANAT_APPROVED) {
      doc.deaneryApprovedAt = new Date();
      const txHash = await this.registerInBlockchain(doc.documentId, doc.hashSha256, this.wallet.address);
      doc.blockchainTxHash = txHash;
      await this.createEvent(doc, 'BLOCKCHAIN_REGISTERED', {
        actorEmail: user.email,
        actorWallet: this.wallet.address,
        txHash,
      });
    }
    await this.approvalsRepo.save({
      document: doc,
      reviewerId: user.sub,
      reviewerName: user.fullName,
      status: nextStatus,
      comment,
      blockchainTxHash: doc.blockchainTxHash ?? '',
    });
    await this.createEvent(doc, nextStatus, {
      actorEmail: user.email,
      actorWallet: this.wallet.address,
      comment,
      txHash: doc.blockchainTxHash,
    });
    return this.toResponse(await this.docsRepo.save(doc));
  }

  async reject(documentId: string, user: JwtUser, reason?: string) {
    const doc = await this.requireDoc(documentId);
    const canReject =
      (user.role === UserRole.KAFEDRA && doc.status === DocumentStatus.PENDING) ||
      (user.role === UserRole.DEKANAT && doc.status === DocumentStatus.KAFEDRA_APPROVED);
    if (!canReject) {
      throw new BadRequestException('Вы не можете отклонить документ на этом этапе');
    }
    doc.status = DocumentStatus.REJECTED;
    await this.createEvent(doc, DocumentStatus.REJECTED, {
      actorEmail: user.email,
      actorWallet: this.wallet.address,
      comment: reason,
    });
    return this.toResponse(await this.docsRepo.save(doc));
  }

  async events(documentId: string, user: { sub: string; role: UserRole }) {
    const doc = await this.requireDoc(documentId);
    if (user.role === UserRole.STUDENT && doc.createdByUserId !== user.sub) {
      throw new NotFoundException('Документ не найден');
    }
    const rows = await this.eventsRepo.find({
      where: { document: { id: doc.id } },
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType,
      actorEmail: row.actorEmail,
      actorWallet: row.actorWallet,
      txHash: row.txHash,
      comment: row.comment,
      createdAt: row.createdAt,
    }));
  }

  async registerOnChain(documentId: string) {
    return this.getByDocumentId(documentId);
  }

  async assignOwner(documentId: string, walletAddress: string, user: JwtUser) {
    void walletAddress;
    void user;
    return this.getByDocumentId(documentId);
  }

  /** Совместимость: старый переход по статусам */
  async transition(documentId: string, toStatus: DocumentStatus, reviewer: JwtUser, comment?: string) {
    const doc = await this.requireDoc(documentId);
    doc.status = toStatus;
    await this.createEvent(doc, toStatus, { actorEmail: reviewer.email, comment });
    return this.toResponse(await this.docsRepo.save(doc));
  }

  /** Сравнение хэша файла с записью в БД и (при наличии) проверка в контракте */
  private async buildVerificationResult(doc: Document, calculatedHash: string) {
    const onChain = this.contract
      ? await this.contract.verifyDocument(doc.documentId, `0x${calculatedHash}`)
      : false;
    const hashMatches = calculatedHash === doc.hashSha256;
    const authentic = hashMatches && Boolean(onChain);
    const base = this.toResponse(doc);
    return {
      ...base,
      calculatedHash,
      hashMatches,
      blockchainVerified: Boolean(onChain),
      authentic,
      verificationMessage: authentic
        ? 'Документ подлинный'
        : 'Документ изменён или не найден в реестре',
    };
  }

  /** POST /documents/:documentId/verify — нужны ID и файл */
  async verify(documentId: string, file: Express.Multer.File) {
    const doc = await this.docsRepo.findOne({ where: { documentId } });
    if (!doc) throw new NotFoundException('Документ не найден');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Только PDF');
    const calculatedHash = createHash('sha256').update(file.buffer).digest('hex');
    return this.buildVerificationResult(doc, calculatedHash);
  }

  /** POST /documents/verify-file — только файл: поиск записи по SHA-256 содержимого */
  async verifyByUploadedFile(file: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException('Загрузите PDF-файл');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Только PDF');
    const calculatedHash = createHash('sha256').update(file.buffer).digest('hex');
    const doc = await this.docsRepo.findOne({ where: { hashSha256: calculatedHash } });
    if (!doc) {
      throw new NotFoundException('Документ с таким содержимым в реестре не найден');
    }
    return this.buildVerificationResult(doc, calculatedHash);
  }

  /** GET /documents/public/:documentId — сведения о документе по ID (без сверки файла) */
  async getPublicByDocumentId(documentId: string) {
    const doc = await this.docsRepo.findOne({ where: { documentId } });
    if (!doc) throw new NotFoundException('Документ не найден');
    const base = this.toResponse(doc);
    return {
      ...base,
      lookupById: true as const,
      verificationMessage: 'Документ найден в системе',
      calculatedHash: null as null,
      hashMatches: null as null,
      blockchainVerified: null as null,
      authentic: null as null,
    };
  }

  /** Документы, загруженные пользователем (для профиля) */
  async listMine(userId: string) {
    const rows = await this.docsRepo.find({
      where: { createdByUserId: userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((d) => ({
      documentId: d.documentId,
      studentFullName: d.studentFullName,
      status: d.status,
      createdAt: d.createdAt,
    }));
  }

  private async requireDoc(documentId: string) {
    const doc = await this.docsRepo.findOne({ where: { documentId } });
    if (!doc) throw new NotFoundException('Документ не найден');
    return doc;
  }

  private toResponse(doc: Document) {
    return {
      id: doc.id,
      documentId: doc.documentId,
      studentFullName: doc.studentFullName,
      studentCode: doc.studentCode,
      specialty: doc.specialty,
      year: doc.year,
      hashSha256: doc.hashSha256,
      hashPreview: doc.hashSha256.slice(0, 16),
      status: doc.status,
      currentStage: doc.currentStage,
      stageHistory: doc.stageHistory ?? [],
      departmentApprovedAt: doc.departmentApprovedAt,
      deaneryApprovedAt: doc.deaneryApprovedAt,
      aiCheckStatus: doc.aiCheckStatus,
      ownerWalletAddress: doc.ownerWalletAddress,
      blockchainTxHash: doc.blockchainTxHash,
      blockchainEvents: doc.blockchainEvents ?? [],
      qrVerificationUrl: doc.qrVerificationUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private async appendChainFromTx(
    doc: Document,
    txHash: string,
    actionType: string,
    actor: string,
  ) {
    if (!txHash) return;
    const ev = doc.blockchainEvents ?? [];
    ev.push({
      txHash,
      actionType,
      actor,
      timestamp: new Date().toISOString(),
    });
    doc.blockchainEvents = ev;
  }

  private async emitActionEventChain(documentId: string, actionType: string): Promise<string> {
    if (!this.contract) return '';
    const tx = await this.contract.emitActionEvent(documentId, actionType);
    const receipt = await tx.wait();
    return receipt?.hash ?? '';
  }

  private async logToBlockchain(documentId: string, hashHex: string, status: DocumentStatus) {
    if (!this.contract) return '';
    const map: Record<DocumentStatus, number> = {
      PENDING: 1,
      KAFEDRA_APPROVED: 2,
      DEKANAT_APPROVED: 3,
      REJECTED: 4,
    };
    const tx = await this.contract.logEvent(documentId, `0x${hashHex}`, map[status]);
    const receipt = await tx.wait();
    return receipt?.hash ?? '';
  }

  private async registerInBlockchain(documentId: string, hashHex: string, universityAddress: string) {
    if (!this.contract) return '';
    const tx = await this.contract.registerDocument(documentId, `0x${hashHex}`, universityAddress);
    const receipt = await tx.wait();
    return receipt?.hash ?? '';
  }

  private async createEvent(
    doc: Document,
    eventType: string,
    payload?: { actorEmail?: string; actorWallet?: string; txHash?: string; comment?: string },
  ) {
    await this.eventsRepo.save(
      this.eventsRepo.create({
        document: doc,
        eventType,
        actorEmail: payload?.actorEmail,
        actorWallet: payload?.actorWallet,
        txHash: payload?.txHash,
        comment: payload?.comment,
      }),
    );
  }
}
