import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TemplateEntity } from './entities/emr_template.entity';

@Global()
@Module({
  imports: [
    // TypeOrmModule.forFeature([TemplateEntity, SysDeptEntity, SysRoleEntity, SysPostEntity, SysTemplateWithPostEntity, SysTemplateWithRoleEntity]),
    TypeOrmModule.forFeature([TemplateEntity,], 'odoo18'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secretkey'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule { }
