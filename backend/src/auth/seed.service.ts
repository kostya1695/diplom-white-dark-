import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger(SeedService.name);

  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  async onApplicationBootstrap() {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD ?? 'admin';
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) {
      this.log.log(`Админ уже есть: ${email}`);
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.usersRepo.save(
      this.usersRepo.create({
        email,
        fullName: 'Administrator',
        role: UserRole.ADMIN,
        passwordHash,
      }),
    );
    this.log.log(`Создан администратор по умолчанию: ${email}`);
  }
}
