import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DeepseekService } from './deepseek.service';
import { DeepseekController } from './deepseek.controller';

// 引入部门，职员，元数据实体
import { HrDeptEntity } from 'src/module/share/hrdept/entities/hrdept.entity';


@Global()
@Module({
    imports: [
        // TypeOrmModule.forFeature([DynamicOptionsEntity, SysDeptEntity, SysRoleEntity, SysPostEntity, SysDynamicOptionsWithPostEntity, SysDynamicOptionsWithRoleEntity]),
        TypeOrmModule.forFeature([HrDeptEntity], 'odoo18'),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('jwt.secretkey'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [DeepseekController],
    providers: [DeepseekService],
    exports: [DeepseekService],
})
export class DeepseekModule { }
