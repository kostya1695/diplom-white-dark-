import { Document } from './document.entity';
import { DocumentStatus } from '../common/enums';
export declare class Approval {
    id: string;
    document: Document;
    reviewerId: string;
    reviewerName: string;
    status: DocumentStatus;
    comment?: string;
    blockchainTxHash: string;
    approvedAt: Date;
}
