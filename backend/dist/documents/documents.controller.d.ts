import { DocumentsService } from './documents.service';
import { ApproveDocumentDto, AssignOwnerDto, RejectDocumentDto, TransitionDto, UploadDocumentDto } from './dto';
import { UserRole } from '../common/enums';
export declare class DocumentsController {
    private readonly docsService;
    constructor(docsService: DocumentsService);
    upload(file: Express.Multer.File, dto: UploadDocumentDto, req: {
        user: {
            sub: string;
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
    list(req: {
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
    }[]>;
    getOne(documentId: string, req: {
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
    approve(documentId: string, dto: ApproveDocumentDto, req: {
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
    reject(documentId: string, dto: RejectDocumentDto, req: {
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
    events(documentId: string, req: {
        user: {
            sub: string;
            role: UserRole;
        };
    }): Promise<{
        id: string;
        eventType: string;
        actorEmail: string | undefined;
        actorWallet: string | undefined;
        txHash: string | undefined;
        comment: string | undefined;
        createdAt: Date;
    }[]>;
    registerOnChain(documentId: string, req: {
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
    assignOwner(documentId: string, dto: AssignOwnerDto, req: {
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
    transition(documentId: string, dto: TransitionDto, req: {
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
