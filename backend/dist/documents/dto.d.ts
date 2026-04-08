import { DocumentStatus } from '../common/enums';
export declare class UploadDocumentDto {
    studentFullName: string;
    studentCode: string;
    specialty: string;
    year: number;
}
export declare class TransitionDto {
    toStatus: DocumentStatus;
    comment?: string;
}
export declare class ApproveDocumentDto {
    comment?: string;
}
export declare class RejectDocumentDto {
    reason?: string;
}
export declare class VerifyDto {
    documentId: string;
}
export declare class AssignOwnerDto {
    walletAddress: string;
}
