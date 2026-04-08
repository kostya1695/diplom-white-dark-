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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const approval_entity_1 = require("./approval.entity");
let Document = class Document {
};
exports.Document = Document;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Document.prototype, "documentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "studentFullName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "studentCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Document.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "minioObjectKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "minioBucket", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "hashSha256", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.DocumentStatus, default: enums_1.DocumentStatus.PENDING }),
    __metadata("design:type", String)
], Document.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "blockchainTxHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "qrVerificationUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Document.prototype, "currentStage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Document.prototype, "stageHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Document.prototype, "departmentApprovedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Document.prototype, "deaneryApprovedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], Document.prototype, "aiCheckStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "ownerWalletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Document.prototype, "blockchainEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => approval_entity_1.Approval, (approval) => approval.document),
    __metadata("design:type", Array)
], Document.prototype, "approvals", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Document.prototype, "updatedAt", void 0);
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)({ name: 'documents' })
], Document);
//# sourceMappingURL=document.entity.js.map