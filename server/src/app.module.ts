import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import configuration from './config/index';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './module/system/auth/auth.module';
// import { UserModule } from './module/system/user/user.module';
import { ToolModule } from './module/system/tool/tool.module';
// import { DeptModule } from './module/system/dept/dept.module';
import { DictModule } from './module/system/dict/dict.module';
import { MenuModule } from './module/system/menu/menu.module';
import { RoleModule } from './module/system/role/role.module';
import { PostModule } from './module/system/post/post.module';
import { SysConfigModule } from './module/system/config/config.module';
import { NoticeModule } from './module/system/notice/notice.module';
import { MainModule } from './module/main/main.module';
import { RedisModule } from './module/redis/redis.module';
import { CacheModule } from './module/monitor/cache/cache.module';
import { LoginlogModule } from './module/monitor/loginlog/loginlog.module';
import { OperlogModule } from './module/monitor/operlog/operlog.module';
import { AxiosModule } from './module/axios/axios.module';
import { OnlineModule } from './module/monitor/online/online.module';
import { ServerModule } from './module/monitor/server/server.module';
import { UploadModule } from './module/upload/upload.module';
import { HrDeptModule } from './module/share/hrdept/hrdept.module';
import { ResUserModule } from './module/share/resuser/resuser.module';
import { MetadataModule } from './module/emrManage/metadata/metadata.module';
import { MedicalRecordModule } from './module/emrManage/medicalRecord/medicalRecord.module';
import { PatientModule } from './module/emrManage/patient/patient.module';
import { TemplateModule } from './module/emrManage/template/template.module';
import { MfaModule } from './module/mfa/mfa.module';
import { RegisCheckModule } from './module/emrManage/registerAndCheckIn/regis_check.module';


import { PatientEntity } from './module/emrManage/registerAndCheckIn/entities/patient.entity';
import { DynamicOptionsModule } from './module/emrManage/dynamicOptions/dynamicOptions.module';
import { DeepseekModule } from './module/emrManage/deepseekAPI/deepseek.module'
import { PrescriptionModule } from './module/emrManage/prescription/pre.module';

@Global()
@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      cache: true,
      load: [configuration],
      isGlobal: true,
    }),
    // 数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          autoLoadEntities: true,
          keepConnectionAlive: true,
          timezone: '+08:00',
          synchronize: true,
          ...config.get('db.postgres'),
        } as TypeOrmModuleOptions;
      },
    }),
    //共享数据库odoo18
    TypeOrmModule.forRootAsync({
      name: 'odoo18',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          entities: [`${__dirname}/module/odoo18/**/*.entity{.ts,.js}`],
          autoLoadEntities: true,
          keepConnectionAlive: true,
          timezone: '+08:00',
          synchronize: true,
          logging: true,
          ...config.get('db.odoo18'),
        } as TypeOrmModuleOptions;
      },
    }),
    // redis
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            closeClient: true,
            readyLog: true,
            errorLog: true,
            config: config.get<RedisClientOptions>('redis'),
          };
        },
      },
      true,
    ),
    HttpModule,
    AuthModule,
    // UserModule,
    ResUserModule,
    ToolModule,
    // DeptModule,
    HrDeptModule,
    DictModule,
    MenuModule,
    RoleModule,
    PostModule,
    SysConfigModule,
    NoticeModule,
    MainModule,
    CacheModule,
    LoginlogModule,
    OperlogModule,
    AxiosModule,
    MfaModule, //自定义totp路由 11.12 update
    OnlineModule,
    ServerModule,
    UploadModule,
    MetadataModule,
    MedicalRecordModule,
    PatientModule,
    TemplateModule,
    RegisCheckModule,
    DynamicOptionsModule,
    DeepseekModule,
    PrescriptionModule
  ],
  providers: [
    // JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule { }
