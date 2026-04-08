"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const document_entity_1 = require("./document.entity");
const approval_entity_1 = require("./approval.entity");
const audit_log_entity_1 = require("./audit-log.entity");
const document_event_entity_1 = require("./document-event.entity");
const documents_service_1 = require("./documents.service");
const documents_controller_1 = require("./documents.controller");
const files_controller_1 = require("./files.controller");
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([document_entity_1.Document, approval_entity_1.Approval, audit_log_entity_1.AuditLog, document_event_entity_1.DocumentEvent])],
        providers: [documents_service_1.DocumentsService],
        controllers: [documents_controller_1.DocumentsController, files_controller_1.FilesController],
        exports: [documents_service_1.DocumentsService],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map