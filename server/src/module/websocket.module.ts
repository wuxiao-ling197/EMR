import { DynamicModule, Global, Module } from '@nestjs/common';
import { OdooWebSocketService } from './websocket.service';
import { ConfigService } from '@nestjs/config';
import { WsGateway } from './websocket.gateway';
import { WsController } from './websocket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from '../share/livechat/entities/channel.entity';

/** 连接odoo websocket，从yml动态加载配置 */
@Global()
@Module({
  //   providers: [OdooWebSocketService],
  //   exports: [OdooWebSocketService],
})
export class OdooWebSocketModule {
  static forRootAsync(): DynamicModule {
    return {
      module: OdooWebSocketModule,
      imports: [TypeOrmModule.forFeature([ChannelEntity], 'shared')],
      providers: [
        {
          provide: 'ODOO_WS_CONFIG',
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            url: config.get('websocket.path'),
            domain: config.get('websocket.domain'),
            auth: {
              db: config.get('db.shared.database'),
              username: config.get('websocket.username'),
              password: config.get('websocket.password'),
            },
          }),
        },
        OdooWebSocketService,
        WsGateway,
      ],
      controllers: [WsController],
      exports: [OdooWebSocketService],
    };
  }
}
