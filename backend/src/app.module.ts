import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthController } from './health.controller';
import { User } from './users/user.entity';
import { Document } from './documents/document.entity';
import { Approval } from './documents/approval.entity';
import { AuditLog } from './documents/audit-log.entity';
import { DocumentEvent } from './documents/document-event.entity';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'postgres'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'diploma_db'),
        entities: [User, Document, Approval, AuditLog, DocumentEvent],
        synchronize: true,
      }),
    }),
    AuthModule,
    DocumentsModule,
  ],
})
export class AppModule {}
