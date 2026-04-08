import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/enums';
import { DocumentsService } from '../documents/documents.service';
import { ConfigService } from '@nestjs/config';
import { Wallet, getAddress } from 'ethers';
import { createCipheriv, createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly documentsService: DocumentsService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const taken = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase().trim() } });
    if (taken) {
      throw new ConflictException('Этот email уже зарегистрирован');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email.toLowerCase().trim(),
      fullName: dto.fullName.trim(),
      role: UserRole.STUDENT,
      passwordHash,
    });
    this.assignGeneratedWallet(user);
    await this.usersRepo.save(user);
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) throw new UnauthorizedException('Неверные учетные данные');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Неверные учетные данные');
    await this.ensureWallet(user);
    return this.sign(user);
  }

  async getProfile(userId: string) {
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
    if (!user) throw new NotFoundException('Пользователь не найден');
    await this.ensureWallet(user as User);
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

  private assignGeneratedWallet(user: User) {
    const generated = Wallet.createRandom();
    user.walletAddress = getAddress(generated.address);
    user.walletPrivateKeyEncrypted = this.encryptPrivateKey(generated.privateKey);
  }

  private async ensureWallet(user: User) {
    if (user.walletAddress) return;
    this.assignGeneratedWallet(user);
    await this.usersRepo.save(user);
  }

  private encryptPrivateKey(privateKey: string) {
    const secret = this.config.get<string>('WALLET_SECRET_KEY', 'dev_wallet_secret_key');
    const key = createHash('sha256').update(secret).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  private sign(user: User) {
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
}
