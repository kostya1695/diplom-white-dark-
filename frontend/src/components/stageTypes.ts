export type DocumentRecord = {
  documentId: string;
  studentFullName?: string;
  specialty?: string;
  year?: number;
  status: string;
  currentStage: number;
  hashPreview?: string;
  createdAt?: string;
  stageHistory?: Array<{
    stage: number;
    action: string;
    actor?: string;
    timestamp: string;
  }>;
  blockchainEvents?: Array<{
    txHash: string;
    actionType: string;
    actor: string;
    timestamp: string;
  }>;
  aiCheckStatus?: string;
  departmentApprovedAt?: string | null;
  deaneryApprovedAt?: string | null;
  ownerWalletAddress?: string | null;
  blockchainTxHash?: string | null;
  qrVerificationUrl?: string | null;
};
