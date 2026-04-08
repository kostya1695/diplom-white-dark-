"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/user.entity");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./jwt.strategy");
const seed_service_1 = require("./seed.service");
const documents_module_1 = require("../documents/documents.module");
const users_controller_1 = require("./users.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            documents_module_1.DocumentsModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET', 'dev_jwt_secret'),
                    signOptions: { expiresIn: config.get('JWT_EXPIRES', '12h') },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController, users_controller_1.UsersController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, seed_service_1.SeedService],
        exports: [jwt_strategy_1.JwtStrategy, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map