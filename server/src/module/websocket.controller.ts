import { Controller, Get, Param, Request } from '@nestjs/common';
import { OdooWebSocketService } from './websocket.service';
import { ApiOperation } from '@nestjs/swagger';
import { ResultData } from 'src/common/utils/result';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelEntity } from '../share/livechat/entities/channel.entity';
import { Repository } from 'typeorm';

@Controller('/ws')
export class WsController {
  constructor(
    @InjectRepository(ChannelEntity, 'shared')
    private readonly channelRepo: Repository<ChannelEntity>,
    private readonly odoows: OdooWebSocketService,
  ) {}

  // 初始化ws连接并等待完成
  @Get('')
  async initWebsocket(@Request() req) {
    try {
      const login_user = req.user.user;
      await this.odoows.connect(login_user);
      console.log('按需ws初始化用户为：', login_user.login);
      // this.odoows.ws = await this.odoows.getConnection(userId);
      return { status: 'WS is connected' };
    } catch (error) {
      return 'Websocket初始化失败，请检查配置信息';
    }
  }

  @ApiOperation({
    summary: '指定频道',
  })
  @Get('/channel/:id')
  async findOne(@Param('id') id: number) {
    const data = await this.channelRepo.findOne({
      where: {
        id: id,
        active: true,
      },
    });
    this.odoows.channelId = id;
    return ResultData.ok(data);
  }
}
