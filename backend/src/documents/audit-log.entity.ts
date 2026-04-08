import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  documentId!: string;

  @Column('simple-json')
  errors!: string[];

  @Column('simple-json')
  warnings!: string[];

  @Column()
  status!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
