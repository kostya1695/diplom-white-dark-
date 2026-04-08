import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { AuditLog } from './audit-log.entity';
import { Approval } from './approval.entity';
import { DocumentStatus } from '../common/enums';
import { ConfigService } from '@nestjs/config';
import { DocumentEvent } from './document-event.entity';
import { UserRole } from '../common/enums';
type JwtUser = {
    sub: string;
    fullName: string;
    email?: string;
    role?: UserRole;
};
export declare class DocumentsService {
    private readonly docsRepo;
    private readonly approvalsRepo;
    private readonly auditRepo;
    private readonly eventsRepo;
    private readonly config;
    private readonly minio;
    private readonly bucket;
    private readonly provider;
    private readonly wallet;
    private readonly contract;
    constructor(docsRepo: Repository<Document>, approvalsRepo: Repository<Approval>, auditRepo: Repository<AuditLog>, eventsRepo: Repository<DocumentEvent>, config: ConfigService);
    ensureBucket(): Promise<void>;
    aiCheck(documentId: string): Promise<{
        errors: string[];
        warnings: string[];
        status: string;
    }>;
    upload(file: Express.Multer.File, payload: {
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
    }, uploadedByUserId: string): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listForUser(user: {
        sub: string;
        role: UserRole;
    }): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getByDocumentId(documentId: string, user?: {
        sub: string;
        role: UserRole;
    }): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approve(documentId: string, user: JwtUser, comment?: string): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reject(documentId: string, user: JwtUser, reason?: string): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    events(documentId: string, user: {
        sub: string;
        role: UserRole;
    }): Promise<{
        id: string;
        eventType: string;
        actorEmail: string | undefined;
        actorWallet: string | undefined;
        txHash: string | undefined;
        comment: string | undefined;
        createdAt: Date;
    }[]>;
    registerOnChain(documentId: string): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignOwner(documentId: string, walletAddress: string, user: JwtUser): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    transition(documentId: string, toStatus: DocumentStatus, reviewer: JwtUser, comment?: string): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verify(documentId: string, file: Express.Multer.File): Promise<{
        calculatedHash: string;
        hashMatches: boolean;
        blockchainVerified: boolean;
        authentic: boolean;
        verificationMessage: string;
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: DocumentStatus;
        currentStage: number;
        stageHistory: {
            stage: number;
            action: string;
            actor?: string;
            timestamp: string;
        }[];
        departmentApprovedAt: Date | undefined;
        deaneryApprovedAt: Date | undefined;
        aiCheckStatus: string;
        ownerWalletAddress: string | undefined;
        blockchainTxHash: string | undefined;
        blockchainEvents: {
            txHash: string;
            actionType: string;
            actor: string;
            timestamp: string;
        }[];
        qrVerificationUrl: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listMine(userId: string): Promise<{
        documentId: string;
        studentFullName: string;
        status: DocumentStatus;
        createdAt: Date;
    }[]>;
    private requireDoc;
    private toResponse;
    private appendChainFromTx;
    private emitActionEventChain;
    private logToBlockchain;
    private registerInBlockchain;
    private createEvent;
}
export {};
