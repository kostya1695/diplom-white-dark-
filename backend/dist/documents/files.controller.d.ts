import { DocumentsService } from './documents.service';
import { UserRole } from '../common/enums';
import { ApproveDocumentDto, AssignOwnerDto, RejectDocumentDto } from './dto';
export declare class FilesController {
    private readonly docsService;
    constructor(docsService: DocumentsService);
    getOne(id: string, req: {
        user: {
            sub: string;
            role: UserRole;
        };
    }): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: import("../common/enums").DocumentStatus;
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
    approve(id: string, dto: ApproveDocumentDto, req: {
        user: {
            sub: string;
            fullName: string;
            email: string;
            role: UserRole;
        };
    }): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: import("../common/enums").DocumentStatus;
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
    reject(id: string, dto: RejectDocumentDto, req: {
        user: {
            sub: string;
            fullName: string;
            email: string;
            role: UserRole;
        };
    }): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: import("../common/enums").DocumentStatus;
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
    register(id: string): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: import("../common/enums").DocumentStatus;
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
    assignOwner(id: string, dto: AssignOwnerDto, req: {
        user: {
            sub: string;
            fullName: string;
        };
    }): Promise<{
        id: string;
        documentId: string;
        studentFullName: string;
        studentCode: string;
        specialty: string;
        year: number;
        hashSha256: string;
        hashPreview: string;
        status: import("../common/enums").DocumentStatus;
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
}
