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
exports.AssignOwnerDto = exports.VerifyDto = exports.RejectDocumentDto = exports.ApproveDocumentDto = exports.TransitionDto = exports.UploadDocumentDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../common/enums");
class UploadDocumentDto {
}
exports.UploadDocumentDto = UploadDocumentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "studentFullName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "studentCode", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "specialty", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], UploadDocumentDto.prototype, "year", void 0);
class TransitionDto {
}
exports.TransitionDto = TransitionDto;
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.DocumentStatus),
    __metadata("design:type", String)
], TransitionDto.prototype, "toStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransitionDto.prototype, "comment", void 0);
class ApproveDocumentDto {
}
exports.ApproveDocumentDto = ApproveDocumentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveDocumentDto.prototype, "comment", void 0);
class RejectDocumentDto {
}
exports.RejectDocumentDto = RejectDocumentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RejectDocumentDto.prototype, "reason", void 0);
class VerifyDto {
}
exports.VerifyDto = VerifyDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyDto.prototype, "documentId", void 0);
class AssignOwnerDto {
}
exports.AssignOwnerDto = AssignOwnerDto;
__decorate([
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Некорректный адрес Ethereum' }),
    __metadata("design:type", String)
], AssignOwnerDto.prototype, "walletAddress", void 0);
//# sourceMappingURL=dto.js.map