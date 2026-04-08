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
exports.DocumentEvent = void 0;
const typeorm_1 = require("typeorm");
const document_entity_1 = require("./document.entity");
let DocumentEvent = class DocumentEvent {
};
exports.DocumentEvent = DocumentEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DocumentEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => document_entity_1.Document, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'document_id' }),
    __metadata("design:type", document_entity_1.Document)
], DocumentEvent.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], DocumentEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DocumentEvent.prototype, "actorEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DocumentEvent.prototype, "actorWallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DocumentEvent.prototype, "txHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DocumentEvent.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], DocumentEvent.prototype, "createdAt", void 0);
exports.DocumentEvent = DocumentEvent = __decorate([
    (0, typeorm_1.Entity)({ name: 'document_events' })
], DocumentEvent);
//# sourceMappingURL=document-event.entity.js.map