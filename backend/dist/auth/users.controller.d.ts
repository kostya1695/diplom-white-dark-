import { AuthService } from './auth.service';
export declare class UsersController {
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
}
