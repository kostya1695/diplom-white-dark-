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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("./document.entity");
const audit_log_entity_1 = require("./audit-log.entity");
const approval_entity_1 = require("./approval.entity");
const enums_1 = require("../common/enums");
const crypto_1 = require("crypto");
const minio_1 = require("minio");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const document_event_entity_1 = require("./document-event.entity");
const enums_2 = require("../common/enums");
let DocumentsService = class DocumentsService {
    constructor(docsRepo, approvalsRepo, auditRepo, eventsRepo, config) {
        this.docsRepo = docsRepo;
        this.approvalsRepo = approvalsRepo;
        this.auditRepo = auditRepo;
        this.eventsRepo = eventsRepo;
        this.config = config;
        this.bucket = this.config.get('MINIO_BUCKET', 'diplomas');
        this.minio = new minio_1.Client({
            endPoint: this.config.get('MINIO_ENDPOINT', 'minio'),
            port: Number(this.config.get('MINIO_PORT', '9000')),
            useSSL: false,
            accessKey: this.config.get('MINIO_ROOT_USER', 'minioadmin'),
            secretKey: this.config.get('MINIO_ROOT_PASSWORD', 'minioadmin'),
        });
        this.provider = new ethers_1.ethers.JsonRpcProvider(this.config.get('BLOCKCHAIN_RPC_URL', 'http://blockchain:8545'));
        this.wallet = new ethers_1.ethers.Wallet(this.config.get('BLOCKCHAIN_PRIVATE_KEY', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'), this.provider);
        const abi = [
            'function logEvent(string documentId, bytes32 hash, uint8 status)',
            'function registerDocument(string documentId, bytes32 hash, address universityAddress)',
            'function verifyDocument(string documentId, bytes32 hash) view returns (bool)',
            'function emitActionEvent(string documentId, string actionType)',
        ];
        const addr = (this.config.get('BLOCKCHAIN_CONTRACT_ADDRESS', '') || '').trim();
        this.contract =
            addr && ethers_1.ethers.isAddress(addr) ? new ethers_1.ethers.Contract(addr, abi, this.wallet) : null;
    }
    async ensureBucket() {
        const exists = await this.minio.bucketExists(this.bucket);
        if (!exists) {
            await this.minio.makeBucket(this.bucket, 'us-east-1');
        }
    }
    async aiCheck(documentId) {
        const warnings = ['Форматирование титульного листа требует проверки человеком'];
        const errors = [];
        const status = errors.length ? 'FAILED' : 'PASSED';
        await this.auditRepo.save({ documentId, errors, warnings, status });
        return { errors, warnings, status };
    }
    async upload(file, payload, uploadedByUserId) {
        if (!file || file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Разрешены только PDF файлы');
        }
        await this.ensureBucket();
        const documentId = (0, crypto_1.randomUUID)();
        const hashSha256 = (0, crypto_1.createHash)('sha256').update(file.buffer).digest('hex');
        const objectKey = `${documentId}.pdf`;
        await this.minio.putObject(this.bucket, objectKey, file.buffer, file.size, {
            'Content-Type': 'application/pdf',
        });
        const now = new Date().toISOString();
        const doc = this.docsRepo.create({
            documentId,
            createdByUserId: uploadedByUserId,
            ...payload,
            minioObjectKey: objectKey,
            minioBucket: this.bucket,
            hashSha256,
            status: enums_1.DocumentStatus.PENDING,
            currentStage: 1,
            stageHistory: [
                {
                    stage: 1,
                    action: 'FIXATION',
                    actor: payload.studentFullName,
                    timestamp: now,
                },
            ],
            aiCheckStatus: 'pending',
            blockchainEvents: [],
        });
        let saved = await this.docsRepo.save(doc);
        await this.createEvent(saved, 'UPLOADED', { actorWallet: this.wallet.address });
        await this.appendChainFromTx(saved, await this.emitActionEventChain(documentId, 'FIXATION'), 'emitAction:FIXATION', this.wallet.address);
        await this.aiCheck(documentId);
        saved.aiCheckStatus = 'passed';
        saved = await this.docsRepo.save(saved);
        return this.toResponse(saved);
    }
    async listForUser(user) {
        const allRoles = [enums_2.UserRole.ADMIN, enums_2.UserRole.KAFEDRA, enums_2.UserRole.DEKANAT];
        const rows = await this.docsRepo.find({
            where: allRoles.includes(user.role) ? {} : { createdByUserId: user.sub },
            order: { createdAt: 'DESC' },
        });
        return rows.map((d) => this.toResponse(d));
    }
    async getByDocumentId(documentId, user) {
        const doc = await this.docsRepo.findOne({ where: { documentId } });
        if (!doc)
            throw new common_1.NotFoundException('Документ не найден');
        if (user && user.role === enums_2.UserRole.STUDENT && doc.createdByUserId !== user.sub) {
            throw new common_1.NotFoundException('Документ не найден');
        }
        return this.toResponse(doc);
    }
    async approve(documentId, user, comment) {
        const doc = await this.requireDoc(documentId);
        let nextStatus = null;
        if (user.role === enums_2.UserRole.KAFEDRA && doc.status === enums_1.DocumentStatus.PENDING) {
            nextStatus = enums_1.DocumentStatus.KAFEDRA_APPROVED;
        }
        if (user.role === enums_2.UserRole.DEKANAT && doc.status === enums_1.DocumentStatus.KAFEDRA_APPROVED) {
            nextStatus = enums_1.DocumentStatus.DEKANAT_APPROVED;
        }
        if (!nextStatus) {
            throw new common_1.BadRequestException('Недопустимый этап согласования для вашей роли');
        }
        doc.status = nextStatus;
        if (nextStatus === enums_1.DocumentStatus.KAFEDRA_APPROVED) {
            doc.departmentApprovedAt = new Date();
        }
        if (nextStatus === enums_1.DocumentStatus.DEKANAT_APPROVED) {
            doc.deaneryApprovedAt = new Date();
            const txHash = await this.registerInBlockchain(doc.documentId, doc.hashSha256, this.wallet.address);
            doc.blockchainTxHash = txHash;
            await this.createEvent(doc, 'BLOCKCHAIN_REGISTERED', {
                actorEmail: user.email,
                actorWallet: this.wallet.address,
                txHash,
            });
        }
        await this.approvalsRepo.save({
            document: doc,
            reviewerId: user.sub,
            reviewerName: user.fullName,
            status: nextStatus,
            comment,
            blockchainTxHash: doc.blockchainTxHash ?? '',
        });
        await this.createEvent(doc, nextStatus, {
            actorEmail: user.email,
            actorWallet: this.wallet.address,
            comment,
            txHash: doc.blockchainTxHash,
        });
        return this.toResponse(await this.docsRepo.save(doc));
    }
    async reject(documentId, user, reason) {
        const doc = await this.requireDoc(documentId);
        const canReject = (user.role === enums_2.UserRole.KAFEDRA && doc.status === enums_1.DocumentStatus.PENDING) ||
            (user.role === enums_2.UserRole.DEKANAT && doc.status === enums_1.DocumentStatus.KAFEDRA_APPROVED);
        if (!canReject) {
            throw new common_1.BadRequestException('Вы не можете отклонить документ на этом этапе');
        }
        doc.status = enums_1.DocumentStatus.REJECTED;
        await this.createEvent(doc, enums_1.DocumentStatus.REJECTED, {
            actorEmail: user.email,
            actorWallet: this.wallet.address,
            comment: reason,
        });
        return this.toResponse(await this.docsRepo.save(doc));
    }
    async events(documentId, user) {
        const doc = await this.requireDoc(documentId);
        if (user.role === enums_2.UserRole.STUDENT && doc.createdByUserId !== user.sub) {
            throw new common_1.NotFoundException('Документ не найден');
        }
        const rows = await this.eventsRepo.find({
            where: { document: { id: doc.id } },
            order: { createdAt: 'ASC' },
        });
        return rows.map((row) => ({
            id: row.id,
            eventType: row.eventType,
            actorEmail: row.actorEmail,
            actorWallet: row.actorWallet,
            txHash: row.txHash,
            comment: row.comment,
            createdAt: row.createdAt,
        }));
    }
    async registerOnChain(documentId) {
        return this.getByDocumentId(documentId);
    }
    async assignOwner(documentId, walletAddress, user) {
        void walletAddress;
        void user;
        return this.getByDocumentId(documentId);
    }
    async transition(documentId, toStatus, reviewer, comment) {
        const doc = await this.requireDoc(documentId);
        doc.status = toStatus;
        await this.createEvent(doc, toStatus, { actorEmail: reviewer.email, comment });
        return this.toResponse(await this.docsRepo.save(doc));
    }
    async verify(documentId, file) {
        const doc = await this.docsRepo.findOne({ where: { documentId } });
        if (!doc)
            throw new common_1.NotFoundException('Документ не найден');
        if (file.mimetype !== 'application/pdf')
            throw new common_1.BadRequestException('Только PDF');
        const calculatedHash = (0, crypto_1.createHash)('sha256').update(file.buffer).digest('hex');
        const onChain = this.contract
            ? await this.contract.verifyDocument(documentId, `0x${calculatedHash}`)
            : false;
        const hashMatches = calculatedHash === doc.hashSha256;
        const authentic = hashMatches && Boolean(onChain);
        const base = this.toResponse(doc);
        return {
            ...base,
            calculatedHash,
            hashMatches,
            blockchainVerified: Boolean(onChain),
            authentic,
            verificationMessage: authentic
                ? 'Документ подлинный'
                : 'Документ изменён или не найден в реестре',
        };
    }
    async listMine(userId) {
        const rows = await this.docsRepo.find({
            where: { createdByUserId: userId },
            order: { createdAt: 'DESC' },
        });
        return rows.map((d) => ({
            documentId: d.documentId,
            studentFullName: d.studentFullName,
            status: d.status,
            createdAt: d.createdAt,
        }));
    }
    async requireDoc(documentId) {
        const doc = await this.docsRepo.findOne({ where: { documentId } });
        if (!doc)
            throw new common_1.NotFoundException('Документ не найден');
        return doc;
    }
    toResponse(doc) {
        return {
            id: doc.id,
            documentId: doc.documentId,
            studentFullName: doc.studentFullName,
            studentCode: doc.studentCode,
            specialty: doc.specialty,
            year: doc.year,
            hashSha256: doc.hashSha256,
            hashPreview: doc.hashSha256.slice(0, 16),
            status: doc.status,
            currentStage: doc.currentStage,
            stageHistory: doc.stageHistory ?? [],
            departmentApprovedAt: doc.departmentApprovedAt,
            deaneryApprovedAt: doc.deaneryApprovedAt,
            aiCheckStatus: doc.aiCheckStatus,
            ownerWalletAddress: doc.ownerWalletAddress,
            blockchainTxHash: doc.blockchainTxHash,
            blockchainEvents: doc.blockchainEvents ?? [],
            qrVerificationUrl: doc.qrVerificationUrl,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    async appendChainFromTx(doc, txHash, actionType, actor) {
        if (!txHash)
            return;
        const ev = doc.blockchainEvents ?? [];
        ev.push({
            txHash,
            actionType,
            actor,
            timestamp: new Date().toISOString(),
        });
        doc.blockchainEvents = ev;
    }
    async emitActionEventChain(documentId, actionType) {
        if (!this.contract)
            return '';
        const tx = await this.contract.emitActionEvent(documentId, actionType);
        const receipt = await tx.wait();
        return receipt?.hash ?? '';
    }
    async logToBlockchain(documentId, hashHex, status) {
        if (!this.contract)
            return '';
        const map = {
            PENDING: 1,
            KAFEDRA_APPROVED: 2,
            DEKANAT_APPROVED: 3,
            REJECTED: 4,
        };
        const tx = await this.contract.logEvent(documentId, `0x${hashHex}`, map[status]);
        const receipt = await tx.wait();
        return receipt?.hash ?? '';
    }
    async registerInBlockchain(documentId, hashHex, universityAddress) {
        if (!this.contract)
            return '';
        const tx = await this.contract.registerDocument(documentId, `0x${hashHex}`, universityAddress);
        const receipt = await tx.wait();
        return receipt?.hash ?? '';
    }
    async createEvent(doc, eventType, payload) {
        await this.eventsRepo.save(this.eventsRepo.create({
            document: doc,
            eventType,
            actorEmail: payload?.actorEmail,
            actorWallet: payload?.actorWallet,
            txHash: payload?.txHash,
            comment: payload?.comment,
        }));
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(approval_entity_1.Approval)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(3, (0, typeorm_1.InjectRepository)(document_event_entity_1.DocumentEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map