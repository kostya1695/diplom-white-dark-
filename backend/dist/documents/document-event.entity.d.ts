import { Document } from './document.entity';
export declare class DocumentEvent {
    id: string;
    document: Document;
    eventType: string;
    actorEmail?: string;
    actorWallet?: string;
    txHash?: string;
    comment?: string;
    createdAt: Date;
}
