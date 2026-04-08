import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly usersRepo;
    private readonly log;
    constructor(usersRepo: Repository<User>);
    onApplicationBootstrap(): Promise<void>;
}
