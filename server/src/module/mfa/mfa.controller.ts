import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MfaService } from '../mfa/mfa.service';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResUserEntity } from '../share/resuser/entities/resuser.entity';
import { ResUserService } from '../share/resuser/resuser.service';
import { Repository } from 'typeorm';
import { LoginDto } from '../main/dto';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import * as base32 from 'base32.js';
import * as QRCode from 'qrcode';
import { ResultData } from 'src/common/utils/result';
import { authenticator } from 'otplib';

@ApiTags('多重验证')
@Controller('auth')
export class MfaController {
  constructor(
    @InjectRepository(ResUserEntity, 'odoo18')
    private readonly userRepo: Repository<ResUserEntity>,
    private readonly resuserService: ResUserService,
    private readonly mafService: MfaService,
  ) { }

  // 只有在完全登录系统后，才会保存当前登录信息到requst中
  @ApiOperation({
    summary: '用户-启用TOTP',
  })
  @Get('/totp/enable/:userId')
  createTotpcode(@Param('userId') userId: number, @Request() req) {
    return this.mafService.createTotpcode(userId, req.user.user);
  }

  @ApiOperation({
    summary: '用户-验证二维码',
  })
  @ApiBody({
    required: true,
  })
  @HttpCode(200)
  @Get('/totp/qrcode')
  async getQRcode(@Body() user: any) {
    const data = await this.userRepo.findOne({
      where: { login: user.username },
    });
    console.log('getQRcode=', user, data);
    if (data.nestSecret && user.firstTotp) {
      // 生成并显示二维码
      const otpUrl = authenticator.keyuri(user.username, 'Nest', data.nestSecret);
      // 生成4个模块数的二维码
      const qrCodeDataURL = await QRCode.toDataURL(otpUrl, {
        width: 212,
        margin: 1,
      }); // 将 URI 转为 Base64 数据 URL 但是太长了 odoo不到一千 nest有快三千字符了
      console.log('二维码转base64=', qrCodeDataURL);
      return ResultData.ok({ otpUrl, qrCodeDataURL }, '生成二维码成功');
    } else {
      return ResultData.fail(500, '生成二维码错误，请重试');
    }
  }

  @ApiOperation({
    summary: '用户-验证TOTP',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @HttpCode(200)
  @Post('/totp/verify')
  validateTotp(@Body() user: any) {
    return this.mafService.validateTotp(user);
  }

  @ApiOperation({
    summary: '用户-关闭TOTP',
  })
  @ApiBody({
    required: true,
  })
  @Delete('/totp/disable/:userId')
  disableTotp(@Param('userId') userId: number) {
    return this.mafService.disableTotp(userId);
  }
}
