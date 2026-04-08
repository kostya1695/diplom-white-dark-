import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { SeedService } from './seed.service';
import { DocumentsModule } from '../documents/documents.module';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    DocumentsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev_jwt_secret'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES', '12h') as any },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtStrategy, SeedService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
