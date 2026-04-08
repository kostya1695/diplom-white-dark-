import { UserRole } from '../common/enums';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    walletAddress?: string;
    walletPrivateKeyEncrypted?: string;
    createdAt: Date;
}
