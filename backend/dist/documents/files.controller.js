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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const enums_1 = require("../common/enums");
const dto_1 = require("./dto");
let FilesController = class FilesController {
    constructor(docsService) {
        this.docsService = docsService;
    }
    getOne(id, req) {
        return this.docsService.getByDocumentId(id, req.user);
    }
    approve(id, dto, req) {
        return this.docsService.approve(id, req.user, dto.comment);
    }
    reject(id, dto, req) {
        return this.docsService.reject(id, req.user, dto.reason);
    }
    register(id) {
        return this.docsService.registerOnChain(id);
    }
    assignOwner(id, dto, req) {
        return this.docsService.assignOwner(id, dto.walletAddress, req.user);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.KAFEDRA, enums_1.UserRole.DEKANAT, enums_1.UserRole.STUDENT),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.KAFEDRA, enums_1.UserRole.DEKANAT),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ApproveDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "approve", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.KAFEDRA, enums_1.UserRole.DEKANAT),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RejectDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "reject", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.Post)(':id/register'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.Post)(':id/assign-owner'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AssignOwnerDto, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "assignOwner", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], FilesController);
//# sourceMappingURL=files.controller.js.map