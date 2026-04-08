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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/user.entity");
const enums_1 = require("../common/enums");
let SeedService = SeedService_1 = class SeedService {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
        this.log = new common_1.Logger(SeedService_1.name);
    }
    async onApplicationBootstrap() {
        const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
        const password = process.env.ADMIN_PASSWORD ?? 'admin';
        const exists = await this.usersRepo.findOne({ where: { email } });
        if (exists) {
            this.log.log(`Админ уже есть: ${email}`);
            return;
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await this.usersRepo.save(this.usersRepo.create({
            email,
            fullName: 'Administrator',
            role: enums_1.UserRole.ADMIN,
            passwordHash,
        }));
        this.log.log(`Создан администратор по умолчанию: ${email}`);
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map