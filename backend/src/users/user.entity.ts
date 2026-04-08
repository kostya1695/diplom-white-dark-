import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../common/enums';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  fullName!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  @Column({ nullable: true })
  walletAddress?: string;

  @Column({ type: 'text', nullable: true })
  walletPrivateKeyEncrypted?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
