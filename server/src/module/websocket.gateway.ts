import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage, MessageBody, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';
import { OdooWebSocketService } from './websocket.service';
import { Inject, Logger } from '@nestjs/common';
import { messageDto } from '../share/livechat/dto';

/** emr后端网关，隔离前端与odoo ws，作为通信桥梁暴露给前端 */
@WebSocketGateway({
  path: '/ws',
  transports: ['websocket'],
  cors: {
    origin: 'https://odoows.tbird.com/', //'*',
    // methods: ['GET', 'POST'],
    // allowedHeaders: ['my-custom-header'],
    credentials: true, //允许发送凭证（如 cookies）
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(WebSocketGateway.name);
  private userId;
  constructor(@Inject(OdooWebSocketService) private service: OdooWebSocketService) {
    console.log('Service in WsGateway:', this.service); // 检查是否注入成功
  }

  // onModuleInit() {
  //   this.WS = this.service.getConnection(2);
  // }

  // 初始化以及响应客户端连接  client为前端传递的参数
  async handleConnection(client: Socket) {
    try {
      this.service.userId = Number(client.handshake.query.userId);
      console.log('连接网关的用户=', this.service.userId);
      console.log('handleConnection', this.service.ws);
      // await this.onListen();
      // 监听odoo  ws消息并转发给前端
      this.service.ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          this.server.emit('odoo-message', parsed); // 广播给所有客户端
          console.log('后端网关广播odoo消息给所有客户端');
          // 或定向发送：client.emit('odoo-message', parsed);
        } catch (e) {
          this.logger.error('Odoo消息解析失败', e);
        }
      });
      this.service.poll(); //首次连接主动获取一次消息
    } catch (error) {
      // console.log(`WsGateway  实例化odoows服务: ${this.logger}, ${this.service}`);
      console.log('WsGateway  handleConnection后端ws连接出错:', error);
    }
  }

  // 响应客户端断开事件
  handleDisconnect() {
    this.logger.log(`WsGateway  断开与odoo ws通信`);
  }

  /** 添加消息过滤与权限控制 
   * 前端使用：
     socket.emit('subscribe-channel', { channelId: TARGET_CHANNEL_ID });
     logToUI({ content: `订阅频道: "${sendMes.messageBody}"成功`, type: 'system' });
  */
  @SubscribeMessage('subscribe-channel')
  async handleSubscribe(@MessageBody() payload: { channelId: number }) {
    try {
      // 验证用户权限
      // if (!this.checkPermission(client, payload.channelId)) {
      //   return { error: '无权访问此频道' };
      // }

      // 调用Odoo轮询方法
      console.log('WsGateway  网关客户端订阅成功=', payload.channelId);
      if (this.service) {
        this.service.channelId = payload.channelId;
        await this.service.poll();
      }
    } catch (error) {
      console.log('WsGateway  handleSubscribe频道订阅出错：', error);
    }
  }

  /** 订阅消息 client: WebSocket, */
  @SubscribeMessage('message')
  async onListen() {
    console.log('onListen', this.service.ws);
    this.service.ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        this.server.emit('odoo-message', parsed); // 广播给所有客户端
        console.log('后端网关广播odoo消息给所有客户端');
        // 或定向发送：client.emit('odoo-message', parsed);
      } catch (e) {
        this.logger.error('Odoo消息解析失败', e);
      }
    });
  }
  //   或者传入属性键从消息正文中提取
  //   handleEvent(@MessageBody('id') id: number): number {
  //   // id === messageBody.id
  //   return id;

  /** 订阅消息 'post'为事件名，客户端连接的参数如：
   * 前端实现：
     socket.emit('post', { 
     channelId: TARGET_CHANNEL_ID, 
     messageBody: "Hello Odoo，我是客户端" 
   }); */
  @SubscribeMessage('post')
  onSend(@MessageBody() payload: messageDto) {
    this.service.sendMessage(payload);
    this.service.ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        this.server.emit('odoo-message', parsed); // 广播给所有客户端
        console.log('后端网关广播odoo消息给所有客户端');
        // 或定向发送：client.emit('odoo-message', parsed);
      } catch (e) {
        this.logger.error('Odoo消息解析失败', e);
      }
    });
    return {
      event: 'post',
      response: `发布通知, data=${payload}`,
    };
  }
}
