import { Injectable } from '@nestjs/common';
import { AuthTotpEntity } from '../share/resuser/entities/auth_totp';
import { Repository } from 'typeorm/repository/Repository';
import { ResultData } from 'src/common/utils/result';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { ResUserEntity } from '../share/resuser/entities/resuser.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '../system/config/config.service';
@Injectable()
export class MfaService {
  private readonly secretSize = 20;
  ALGORITHM = 'HmacSHA1'; // HMAC SHA1
  DIGITS = 6; // 生成的验证码的位数
  constructor(
    @InjectRepository(ResUserEntity, 'odoo18')
    private readonly userRepo: Repository<ResUserEntity>,
    @InjectRepository(AuthTotpEntity, 'odoo18')
    public readonly totpEntityRep: Repository<AuthTotpEntity>,
    private readonly configService: ConfigService,
  ) { }

  /**
   * 激活totp认证 生成totp secret
   * @param userId 操作对象
   * @param user 当前操作用户
   * @returns
   */
  async createTotpcode(userId: number, user: any) {
    console.log('----createTotp---------');

    let data;
    try {
      data = await this.userRepo.createQueryBuilder('user').where('user.id = :id', { id: userId }).select(['user.id', 'user.nestSecret', 'user.login']).getOne();
    } catch (err) {
      console.log(err);

    }
    let activateTotp = false;
    // 显式设置算法
    authenticator.options = { crypto: require('crypto'), HashAlgorithms: this.ALGORITHM, windows: 0 };
    // 如果用户没有开启totp验证（即user表中secret无值）
    if (data.nestSecret == null || data.nestSecret == '' || data.nestSecret == 'false') {
      const secret = authenticator.generateSecret(40).substring(0, 32);
      await this.userRepo.update(userId, { nestSecret: secret, writeUid: user.id, writeDate: new Date() });
      activateTotp = true;
      console.log('update totp secret=', await this.userRepo.findOne({ where: { id: userId } }));
    }
    return ResultData.ok(
      {
        data,
        activateTotp,
      },
      '启用totp',
    );
  }

  /**
   * totp验证 首次验证及后续验证 在verify路由 直接查auth_wiard有没有secret,在激活又关闭totp后，用户表和该表内secret均清零，以此实现二维码单次生成。
   * @param code 认证码
   * @param user 认证用户
   * @returns
   */
  async validateTotp(user: any) {
    console.log(user);

    const data = await this.userRepo.findOne({
      where: { login: user.username },
    });
    let cuUser;
    try {
      cuUser = await this.totpEntityRep.createQueryBuilder('totp').where({ userId: data.id }).select(['totp.id', 'totp.secret']).getMany();
      console.log(cuUser);
    } catch (err) {
      console.error(err);
    }
    const totps = cuUser
      .filter((user) => user.secret && user.secret !== '' && user.secret !== 'false') // 过滤出 value 不为空的记录
      .map((user) => user.id);
    console.log('查totp激活记录：', totps);
    if (totps.length == 0) {
      console.log('show qrCodeImg======================');
      try {
        // 生成并显示二维码
        const otpUrl = authenticator.keyuri(user.username, 'Nest', data.nestSecret);
        // 生成4个模块数的二维码
        const qrCodeDataURL = await QRCode.toDataURL(otpUrl, {
          width: 212,
          margin: 1,
        }); // 将 URI 转为 Base64 数据 URL 但是太长了 odoo不到一千 nest有快三千字符了 不过没影响
        console.log(user.code);
        console.log(typeof user.code);

        const verify = authenticator.check(user.code, data.nestSecret);
        if (verify) {
          const authtotp = new AuthTotpEntity();
          authtotp.userId = data.id;
          authtotp.secret = data.nestSecret; //安全起见只在用户表存
          authtotp.code = user.code;
          authtotp.url = otpUrl;
          authtotp.qrcode = qrCodeDataURL;
          authtotp.createUid = data.id;
          authtotp.createDate = new Date();
          authtotp.writeUid = data.id;
          authtotp.writeDate = new Date();
          await this.totpEntityRep.save({ ...authtotp }); // 使用 save 方法插入数据
        }
        return ResultData.ok({ verify, otpUrl, qrCodeDataURL }, '激活并验证成功');
      } catch (err) {
        console.log(err);
        return ResultData.fail(500, '认证失败')
      }
    }
    // 如果不是第一次激活，直接验证
    if (totps.length > 0) {
      const verify = authenticator.check(user.code, data.nestSecret); //totp.verify({ token: user.code, secret: data.nestSecret });
      if (verify) {
        const result = await this.totpEntityRep.update({ id: totps[0] }, { writeUid: data.id, writeDate: new Date() });
        console.log('更新认证时间：', result);
      }
      return ResultData.ok({ verify }, '验证成功');
    }
  }

  /**
   * 关闭TOTP
   * @param userId
   * @returns
   */
  async disableTotp(userId: number) {
    const mfa = await this.userRepo.update({ id: userId }, { nestSecret: '' });
    const result = await this.totpEntityRep.update({ userId: userId }, { secret: '', writeDate: new Date() });
    console.log(mfa, result);
    return ResultData.ok('已关闭TOTP双重验证');
  }

  public async forRobot() {
    return await this.totpEntityRep.findOne({
      where: { id: 14 },
    });
  }
}
