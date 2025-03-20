import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrDeptService } from './hrdept.service';
import { HrDeptController } from './hrdept.controller';
import { HrDeptEntity } from './entities/hrdept.entity';
import { ResCompEntity } from '../resuser/entities/rescompany.entity';

@Global()
@Module({
  // forFeature方法来指定实体所使用的连接
  imports: [TypeOrmModule.forFeature([HrDeptEntity, ResCompEntity], 'odoo18')],
  controllers: [HrDeptController],
  providers: [HrDeptService],
  exports: [HrDeptService],
})
export class HrDeptModule { }
