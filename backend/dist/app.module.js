"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const documents_module_1 = require("./documents/documents.module");
const health_controller_1 = require("./health.controller");
const user_entity_1 = require("./users/user.entity");
const document_entity_1 = require("./documents/document.entity");
const approval_entity_1 = require("./documents/approval.entity");
const audit_log_entity_1 = require("./documents/audit-log.entity");
const document_event_entity_1 = require("./documents/document-event.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'postgres'),
                    port: Number(config.get('DB_PORT', '5432')),
                    username: config.get('DB_USER', 'postgres'),
                    password: config.get('DB_PASSWORD', 'postgres'),
                    database: config.get('DB_NAME', 'diploma_db'),
                    entities: [user_entity_1.User, document_entity_1.Document, approval_entity_1.Approval, audit_log_entity_1.AuditLog, document_event_entity_1.DocumentEvent],
                    synchronize: true,
                }),
            }),
            auth_module_1.AuthModule,
            documents_module_1.DocumentsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map