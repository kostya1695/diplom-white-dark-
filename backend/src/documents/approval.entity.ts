import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from './document.entity';
import { DocumentStatus } from '../common/enums';

@Entity({ name: 'approvals' })
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Document, (doc) => doc.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Column()
  reviewerId!: string;

  @Column()
  reviewerName!: string;

  @Column({ type: 'enum', enum: DocumentStatus })
  status!: DocumentStatus;

  @Column({ nullable: true })
  comment?: string;

  @Column()
  blockchainTxHash!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  approvedAt!: Date;
}
