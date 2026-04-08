import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../common/enums';
import { BatchUpdateRolesDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findAllForAdmin(): Promise<
    Pick<User, 'id' | 'email' | 'fullName' | 'role' | 'createdAt'>[]
  > {
    const rows = await this.usersRepo.find({
      order: { email: 'ASC' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
    return rows;
  }

  async batchUpdateRoles(
    dto: BatchUpdateRolesDto,
  ): Promise<{ updated: number }> {
    const { updates } = dto;
    if (!updates.length) {
      return { updated: 0 };
    }

    const ids = updates.map((u) => u.userId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('В запросе повторяется userId');
    }

    return this.usersRepo.manager.transaction(async (em) => {
      const repo = em.getRepository(User);
      const users = await repo.find({ where: { id: In(ids) } });
      if (users.length !== ids.length) {
        throw new NotFoundException('Один или несколько пользователей не найдены');
      }

      const byId = new Map(users.map((u) => [u.id, u]));

      for (const u of updates) {
        const user = byId.get(u.userId)!;
        if (user.role === UserRole.ADMIN) {
          throw new BadRequestException(
            'Нельзя изменить роль пользователя с ролью ADMIN',
          );
        }
        user.role = u.role;
      }

      await repo.save(users);
      return { updated: users.length };
    });
  }
}
