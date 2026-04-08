import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    me(req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("../common/enums").UserRole;
        walletAddress: string | undefined;
        createdAt: Date;
        documents: {
            documentId: string;
            studentFullName: string;
            status: import("../common/enums").DocumentStatus;
            createdAt: Date;
        }[];
    }>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            sub: string;
            email: string;
            fullName: string;
            role: import("../common/enums").UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            sub: string;
            email: string;
            fullName: string;
            role: import("../common/enums").UserRole;
        };
    }>;
}
