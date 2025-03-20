import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResUserService } from './resuser.service';
import { ResUserController } from './resuser.controller';
import { ResUserEntity } from './entities/resuser.entity';
import { HrDeptEntity } from '../hrdept/entities/hrdept.entity';
import { HrEmpEntity } from './entities/hremp.entity';
import { SysUserWithRoleEntity } from 'src/module/system/user/entities/user-width-role.entity';
import { SysRoleEntity } from 'src/module/system/role/entities/role.entity';
import { CompUserEntity } from './entities/comuserrel';
import { ResCompEntity } from './entities/rescompany.entity';
import { ResoureceEntity } from './entities/resource.entity';
import { AuthTotpEntity } from './entities/auth_totp';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ResUserEntity, HrEmpEntity, HrDeptEntity, CompUserEntity, ResCompEntity, ResoureceEntity, AuthTotpEntity], 'odoo18'),
    TypeOrmModule.forFeature([SysUserWithRoleEntity, SysRoleEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secretkey'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ResUserController],
  providers: [ResUserService],
  exports: [ResUserService],
})
export class ResUserModule { }
