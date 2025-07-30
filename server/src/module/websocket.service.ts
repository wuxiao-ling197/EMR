import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { RedisService } from 'src/module/redis/redis.service';
import * as https from 'https';
import { Agent } from 'undici';
import { random } from 'lodash';
import axios from 'axios';
import { messageDto } from '../share/livechat/dto';
import { randomBytes } from 'crypto';
import { LoginDto } from '../main/dto';

/** 后端实现与odoo ws的连接通信 按需加载只有实施聊天的用户才会创建ws连接
 * TODO：动态会话认证和多租户隔离，确保每个用户能够创建自己独立的与odoo的用心
 * 解决方案：{ scope: Scope.DEFAULT } 显式声明单例服务（默认）
 * @Inject(REQUEST)实现动态注入请求上下文数据，该上下文中应包含当前用户信息 implements OnModuleInit
 */
@Injectable()
export class OdooWebSocketService implements OnModuleInit {
  public ws: WebSocket;
  private currentUser = new Map<number, WebSocket>(); //
  private readonly logger = new Logger(OdooWebSocketService.name);
  private lastMessageID = 0;
  private sessionCookie = '';
  public channelId = 1;
  public userId = 0;
  private partnerId = 0;
  private user: any;
  constructor(
    // @Inject(REQUEST) private readonly request: Request, //注入请求上下文对象
    @Inject('ODOO_WS_CONFIG')
    private readonly config: any,
    private readonly redisService: RedisService, //constructor为当前模块构造函数，它会自动查找依赖、解析依赖、注入实例,但不代表它会完成初始化
  ) {}

  async onModuleInit() {
    this.logger.log('OdooWebSocketService初始化成功');
    // this.userId = this.user.user.id;
    // await this.connect(2);
  }

  // 按需初始化连接（controller调用）
  public async connect(login: any): Promise<WebSocket> {
    return new Promise(async (resolve) => {
      console.log('http传来的用户信息=', login.login);
      // 如果用户已存在ws连接返回，避免重复连接。
      this.user = login;
      this.userId = login.id;
      // if (this.currentUser.has(userId)) return this.currentUser.get(userId);
      if (this.currentUser.has(this.userId)) {
        this.ws = await this.getConnection(this.userId);
        this.attachHandlers();
        console.log('初始化连接先检验本地连接映射=', this.userId, this.currentUser.size, this.ws.readyState);
        resolve(this.ws);
      } else {
        // 反之，创建ws连接
        // await this.getOdooSessionAuth(); // 会话认证
        // 获取session_id
        this.sessionCookie = await this.redisService.get(`session:user:${login.login}`); //`session:user:${this.user.user.login}`
        this.logger.log(`ws地址为：${this.config.url},从上下文中获取到的用户信息：${login.login},认证：${this.sessionCookie}`);
        this.ws = new WebSocket(this.config.url, {
          rejectUnauthorized: false, // 不推荐生产环境使用
          headers: {
            Upgrade: 'websocket',
            Connection: 'Upgrade',
            'X-Forwarded-Proto': 'https',
            'X-Forwarded-For': '192.168.0.30',
            'X-Forwarded-Host': 'odoows.tbird.com',
            'X-Real-IP': '192.168.0.30',
            'Sec-WebSocket-Key': randomBytes(16).toString('base64'),
            'Sec-WebSocket-Version': '13',
            Cookie: `session_id=${this.sessionCookie}`,
            Origin: 'https://odoows.tbird.com', // 可选但建议
          },
        });
        this.ws.on('open', async () => {
          await this.savaConnection(login.id, this.ws);
          console.log('保存到本地映射');
          resolve(this.ws);
          this.poll(); // 开始第一次轮询
          this.logger.log(`Odoo WebSocket 连接状态为：${this.ws.readyState}`); //0-3 连接中 成功 关闭中 断开
          this.ws.once('message', (data) => {
            const response = JSON.parse(data.toString());
            // if (response.error) console.log(response.error);
            // else console.log('认证成功后立即进行消息监听2:', response);
          });
        });
        this.attachHandlers();
        // this.ws.once('message', (data) => {
        //   const response = JSON.parse(data.toString());
        //   //   console.log('认证成功后立即进行消息监听:', response);
        //   if (response.error) console.log(response.error);
        //   else console.log('认证成功后立即进行消息监听2:', response);
        // });
        // return this.ws;
      }
    });
  }

  /** ws附加事件处理器
   * error、close事件 */
  private attachHandlers(): void {
    this.ws.on('message', (data) => {
      const response = JSON.parse(data.toString());
      //   console.log('长久监听:', response);
      // if (response.error) console.log(response.error);
      // else console.log('长久监听2:', response);
    });

    this.ws.on('close', () => {
      this.logger.warn('Odoo WS 断开连接，重连中...');
      // 5s自动重连
      setTimeout(() => this.connect(2), 5000);
    });

    this.ws.on('error', (error: Error) => {
      this.startHeartbeat();
      this.logger.error(`Odoo WS 连接错误:${error}`);
      if (error.message.includes('cert')) {
        this.logger.error('证书验证失败，请检查服务器证书配置');
        // 可以在这里尝试重新连接或其他处理逻辑
      }
    });
  }

  /** 向ws发起轮询请求。订阅目标频道
   * todo:好像应该动态传入目标频道哈【在登录用户比较多的时候】 */
  async poll() {
    this.ws = await this.getConnection(this.userId);
    console.log('service 向ws发起轮询请求=', this.ws, this.channelId);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const channels = [
        `discuss.channel_${this.channelId}`, // 监听目标频道
        // "res.partner_13",
        'res.partner_2', //oboobot
        'res.partner_3', //administrator
        // 您可以根据需要添加其他个人或系统频道
      ];
      const pollMessage = {
        event_name: 'subscribe',
        data: {
          channels: channels,
          thread_id: this.channelId,
          //   user_id: this.userId,
          last: this.lastMessageID,
        },
        id: Math.floor(Math.random() * 1000000000),
      };
      this.ws.send(JSON.stringify(pollMessage));
      this.logger.log(`成功订阅频道 ${this.channelId}，已发起轮询请求`);
    } else {
      console.error('Odoo Websocket连接失败！长轮询配置出错：', this.channelId);
    }
  }

  /** odoo会话认证 传入登录数据动态认证*/
  async getOdooSessionAuth(data: LoginDto) {
    // return new Promise(async (resolve, reject) => {
    const agent = new https.Agent({
      rejectUnauthorized: false, // 忽略证书验证
    });
    const authUrl = `${this.config.domain}/web/session/authenticate`;
    const params = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: this.config.auth.db,
        // login: this.config.auth.username,
        // password: this.config.auth.password,
        login: data.username,
        password: data.password,
        context: {},
      },
      id: random(0, 100000000),
    };
    try {
      const response = await axios.post(authUrl, params, {
        httpsAgent: agent, // 在请求中应用 agent
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true, // 接受所有状态码
      });
      if (response.data.error) {
        throw new Error(`Odoo RPC Error: ${response.data.error.message}`);
      }
      const cookies = response.headers['set-cookie'];
      if (!cookies || cookies.length === 0) {
        console.error('❌ 致命问题: Odoo 认证成功但未在响应头中返回 set-cookie。');
      }
      for (const cookie of cookies) {
        if (cookie.includes('session_id=')) {
          const sessionId = cookie.split(';')[0].split('=')[1];
          // this.userId = response.data.result.uid; //odoo对应内部用户id
          // this.partnerId = response.data.result.partner_id; //odoo对应联系人id
          // redis缓存odoo会话认证和ws连接数据
          await this.redisService.set(`session:user:${data.username}`, sessionId);
          // this.sessionCookie = await this.redisService.get(`session:user:${data.username}:`);
          // this.sessionCookie = sessionId;
          // return sessionId;
        }
      }
      // this.userId = response.data.result.uid; //odoo对应内部用户id
      // this.partnerId = response.data.result.partner_id; //odoo对应联系人id 用户编码：${this.userId},联系人${this.partnerId},并保存到redis,${this.currentUser}
      console.log(`✅ 成功获取 session_id.`);
      // 会话认证成功开始监听消息
      // this.ws.once('message', (data) => {
      //   console.log('认证成功后立即进行消息监听');
      //   const response = JSON.parse(data.toString());
      //   if (response.error) reject(response.error);
      //   else resolve(response.result);
      // });
    } catch (error) {
      console.error('❌ Odoo 会话认证失败:', error.response ? error.response.data : error.message);
    }
    // });
  }

  /** 启动心跳机制 */
  private startHeartbeat(): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000); // 每30秒发送一次ping
  }

  /**向odoo 内部频道发布通知消息
   * 返回值设置为 Promise<void>表示该 Promise ​​解析（resolve）时不携带任何有效数据​​。调用此方法后，无法通过 await获取返回值，仅能等待操作完成。
   */
  async sendMessage(data: messageDto): Promise<void> {
    // 在真实的集成中，您需要先通过一个API（如/web/session/get_session_info）获取CSRF令牌。
    // 创建一个 agent 来忽略 SSL 证书验证错误
    // 警告：这仅适用于开发环境或受信任的内部网络
    console.log('sendMessage数据：', data);
    const agent = new Agent({
      connect: {
        rejectUnauthorized: false, // 关键设置：禁用证书验证
      },
    });
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        thread_model: 'discuss.channel',
        thread_id: data.channelId,
        post_data: {
          body: data.messageBody,
          message_type: 'comment',
          subtype_xmlid: 'mail.mt_comment',
        },
      },
    };
    try {
      // 该fetch会开启新的渠道通信，因此无法继承emr路由/channel/message/post中的headers(主要是session_id),因此需要手动传递
      const session = await this.redisService.get(`session:user:${data.user}`);
      const response = await fetch(`${this.config.domain}/mail/message/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `session_id=${session}` },
        body: JSON.stringify(payload),
        // 使用自定义 agent 发送请求
        // @ts-expect-error - Node.js的全局fetch类型定义可能不包含dispatcher，忽略此行类型检查
        dispatcher: agent,
      });
      // console.log('请求头=', response.headers);
      const json = await response.json();
      // console.log('service-----------发起post请求：', json);
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.data?.message || errorData.error?.message || `HTTP 错误! 状态: ${response.status}`;
        this.logger.error('service--------请求路由返回错误信息:', errorMessage);
        return errorMessage;
      }
      //   this.ws.on('message', response);
      // this.client.send(payload);
      return json;
    } catch (error) {
      console.error('service--------发送消息失败:', error);
      this.logger.error(`service--------发送消息失败:${error},重试中`);
    }
  }

  /** Map映射即本地存储 适合小型医院日活量<500
   * redis+本地存储 只适合中型医院日活量在500-3000
   * 对于三甲医院日活量>3000，应该采用Kafka + Kubernetes架构实现
   */
  async savaConnection(userId: number, ws: WebSocket): Promise<void> {
    // 本地只保留活跃连接
    if (this.currentUser.size < 5000) {
      this.currentUser.set(userId, ws);
    }
    // 存储必要元数据而非ws对象
    // const value = {
    //   ip: ws._socket.remoteAddress,
    //   connectedAt: Date.now(),
    // };
    // await this.redisService.hset(`ws:connections:${userId}`, userId.toString(), JSON.stringify(value));
  }

  /** 获取连接 */
  async getConnection(userId: number): WebSocket {
    console.log('获取本地连接=', this.currentUser.has(userId));
    // 先查本地
    if (this.currentUser.has(userId)) {
      console.log('getConnection获取本地连接映射');
      return this.currentUser.get(userId);
    }
    // 再查redis(存储的是ws序列化信息)
    // const meta = await this.redisService.get(`ws:connections:${userId}`);
    // return meta; //TODO: 需要完善。
  }

  /** 同一用户多设备登录 */
  addConnection(userId: number, ws: WebSocket) {
    if (!this.currentUser.has(userId)) {
      this.currentUser.set(userId, new Set());
    }
    this.currentUser.get(userId).add(ws);
  }
}
