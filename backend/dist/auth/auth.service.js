"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const enums_1 = require("../common/enums");
const documents_service_1 = require("../documents/documents.service");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(usersRepo, jwtService, documentsService, config) {
        this.usersRepo = usersRepo;
        this.jwtService = jwtService;
        this.documentsService = documentsService;
        this.config = config;
    }
    async register(dto) {
        const taken = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase().trim() } });
        if (taken) {
            throw new common_1.ConflictException('Этот email уже зарегистрирован');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.usersRepo.create({
            email: dto.email.toLowerCase().trim(),
            fullName: dto.fullName.trim(),
            role: enums_1.UserRole.STUDENT,
            passwordHash,
        });
        this.assignGeneratedWallet(user);
        await this.usersRepo.save(user);
        return this.sign(user);
    }
    async login(dto) {
        const user = await this.usersRepo.findOne({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Неверные учетные данные');
        await this.ensureWallet(user);
        return this.sign(user);
    }
    async getProfile(userId) {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Пользователь не найден');
        await this.ensureWallet(user);
        const documents = await this.documentsService.listMine(userId);
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt,
            documents,
        };
    }
    assignGeneratedWallet(user) {
        const generated = ethers_1.Wallet.createRandom();
        user.walletAddress = (0, ethers_1.getAddress)(generated.address);
        user.walletPrivateKeyEncrypted = this.encryptPrivateKey(generated.privateKey);
    }
    async ensureWallet(user) {
        if (user.walletAddress)
            return;
        this.assignGeneratedWallet(user);
        await this.usersRepo.save(user);
    }
    encryptPrivateKey(privateKey) {
        const secret = this.config.get('WALLET_SECRET_KEY', 'dev_wallet_secret_key');
        const key = (0, crypto_1.createHash)('sha256').update(secret).digest();
        const iv = (0, crypto_1.randomBytes)(12);
        const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
    }
    sign(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: payload,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        documents_service_1.DocumentsService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map