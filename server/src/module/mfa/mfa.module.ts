import { Global, Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { ResUserEntity } from '../share/resuser/entities/resuser.entity';
import { AuthTotpEntity } from '../share/resuser/entities/auth_totp';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaController } from './mfa.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ResUserEntity, AuthTotpEntity], 'odoo18'), // Ensure the entity is registered here
  ],
  providers: [MfaService],
  controllers: [MfaController],
  exports: [MfaService],
})
export class MfaModule { }
