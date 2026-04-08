import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/enums';
import { DocumentsService } from '../documents/documents.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly usersRepo;
    private readonly jwtService;
    private readonly documentsService;
    private readonly config;
    constructor(usersRepo: Repository<User>, jwtService: JwtService, documentsService: DocumentsService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            sub: string;
            email: string;
            fullName: string;
            role: UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            sub: string;
            email: string;
            fullName: string;
            role: UserRole;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
        walletAddress: string | undefined;
        createdAt: Date;
        documents: {
            documentId: string;
            studentFullName: string;
            status: import("../common/enums").DocumentStatus;
            createdAt: Date;
        }[];
    }>;
    private assignGeneratedWallet;
    private ensureWallet;
    private encryptPrivateKey;
    private sign;
}
