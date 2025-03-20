import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MedicalRecordService } from './medicalRecord.service';
import { MedicalRecordController } from './medicalRecord.controller';
import { MedicalRecordEntity } from './entities/emr-medical-record.entity';

import { MedicalRecordWithPostEntity } from './entities/medical-record-width-post.entity';
import { MedicalRecordWithRoleEntity } from './entities/medical-record-width-role.entity';
// import { SysDeptEntity } from '../dept/entities/dept.entity';
// import { SysRoleEntity } from '../role/entities/role.entity';
// import { SysPostEntity } from '../post/entities/post.entity';

@Global()
@Module({
  imports: [
    // TypeOrmModule.forFeature([MedicalRecordEntity, SysDeptEntity, SysRoleEntity, SysPostEntity, SysMedicalRecordWithPostEntity, SysMedicalRecordWithRoleEntity]),
    TypeOrmModule.forFeature([MedicalRecordEntity, MedicalRecordWithPostEntity, MedicalRecordWithRoleEntity], 'odoo18'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secretkey'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
  exports: [MedicalRecordService],
})
export class MedicalRecordModule { }
