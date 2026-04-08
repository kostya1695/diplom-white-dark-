import { DocumentStatus } from '../common/enums';
import { Approval } from './approval.entity';
export declare class Document {
    id: string;
    documentId: string;
    createdByUserId?: string;
    studentFullName: string;
    studentCode: string;
    specialty: string;
    year: number;
    minioObjectKey: string;
    minioBucket: string;
    hashSha256: string;
    status: DocumentStatus;
    blockchainTxHash?: string;
    qrVerificationUrl?: string;
    currentStage: number;
    stageHistory?: Array<{
        stage: number;
        action: string;
        actor?: string;
        timestamp: string;
    }>;
    departmentApprovedAt?: Date;
    deaneryApprovedAt?: Date;
    aiCheckStatus: string;
    ownerWalletAddress?: string;
    blockchainEvents?: Array<{
        txHash: string;
        actionType: string;
        actor: string;
        timestamp: string;
    }>;
    approvals: Approval[];
    createdAt: Date;
    updatedAt: Date;
}
