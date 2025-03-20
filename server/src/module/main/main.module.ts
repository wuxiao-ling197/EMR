import { Module } from '@nestjs/common';
import { MainService } from './main.service';
import { MainController } from './main.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrEmpEntity } from '../share/resuser/entities/hremp.entity';
import { ResUserEntity } from '../share/resuser/entities/resuser.entity';
import { HrDeptEntity } from '../share/hrdept/entities/hrdept.entity';
import { CompUserEntity } from '../share/resuser/entities/comuserrel';
import { MetadataEntity } from '../emrManage/metadata/entities/emr-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HrEmpEntity, ResUserEntity, HrDeptEntity, CompUserEntity], 'odoo18'), // Ensure the entity is registered here
  ],
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule { }
