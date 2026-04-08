import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentStatus } from '../common/enums';
import { Approval } from './approval.entity';

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  documentId!: string;

  /** Кто загрузил документ (администратор) */
  @Column({ type: 'uuid', nullable: true })
  createdByUserId?: string;

  @Column()
  studentFullName!: string;

  @Column()
  studentCode!: string;

  @Column()
  specialty!: string;

  @Column()
  year!: number;

  @Column()
  minioObjectKey!: string;

  @Column()
  minioBucket!: string;

  @Column()
  hashSha256!: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status!: DocumentStatus;

  @Column({ nullable: true })
  blockchainTxHash?: string;

  @Column({ nullable: true })
  qrVerificationUrl?: string;

  /** Текущий этап пайплайна (1–5) */
  @Column({ type: 'int', default: 1 })
  currentStage!: number;

  /** История этапов и действий (JSON) */
  @Column({ type: 'jsonb', nullable: true })
  stageHistory?: Array<{
    stage: number;
    action: string;
    actor?: string;
    timestamp: string;
  }>;

  @Column({ type: 'timestamptz', nullable: true })
  departmentApprovedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deaneryApprovedAt?: Date;

  /** pending | passed | skipped */
  @Column({ default: 'pending' })
  aiCheckStatus!: string;

  @Column({ nullable: true })
  ownerWalletAddress?: string;

  /** События блокчейна (транзакции / действия) */
  @Column({ type: 'jsonb', nullable: true })
  blockchainEvents?: Array<{
    txHash: string;
    actionType: string;
    actor: string;
    timestamp: string;
  }>;

  @OneToMany(() => Approval, (approval) => approval.document)
  approvals!: Approval[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
