import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity({ name: 'document_events' })
export class DocumentEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document;

  @Column({ length: 50 })
  eventType!: string;

  @Column({ length: 255, nullable: true })
  actorEmail?: string;

  @Column({ length: 255, nullable: true })
  actorWallet?: string;

  @Column({ length: 255, nullable: true })
  txHash?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
