import { Controller, Get, Post, Body, HttpCode, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import * as Useragent from 'useragent';
import { MainService } from './main.service';
import { RegisterDto, LoginDto } from './dto/index';
import { createMath } from 'src/common/utils/captcha';
import { ResultData } from 'src/common/utils/result';
import { GenerateUUID } from 'src/common/utils/index';
import { RedisService } from 'src/module/redis/redis.service';
import { CacheEnum } from 'src/common/enum/index';
import { ConfigService } from 'src/module/system/config/config.service';
import { HrEmpEntity } from '../share/resuser/entities/hremp.entity';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResUserEntity } from '../share/resuser/entities/resuser.entity';
import { HrDeptEntity } from '../share/hrdept/entities/hrdept.entity';
import { ResUserService } from '../share/resuser/resuser.service';
import { CompUserEntity } from '../share/resuser/entities/comuserrel';
import { MfaService } from '../mfa/mfa.service';
// import { sendMsg } from 'src/common/utils/robot';
// import { OAmanageController } from '../share/OAmanage/oamanage.controller';
// import { faceIdValid, faceIdValidWithPeriod, phoneStatus, phoneValid } from 'src/common/utils/faceid';

@ApiTags('根目录')
@Controller('/')
export class MainController {
  constructor(
    @InjectRepository(HrEmpEntity, 'odoo18')
    private readonly employeeEntityRep: Repository<HrEmpEntity>,
    @InjectRepository(ResUserEntity, 'odoo18')
    private readonly userRepo: Repository<ResUserEntity>,
    @InjectRepository(HrDeptEntity, 'odoo18')
    private readonly deptEntityRep: Repository<HrDeptEntity>,
    @InjectRepository(CompUserEntity, 'odoo18')
    private readonly userWithcompanyEntityRep: Repository<CompUserEntity>,

    private readonly mainService: MainService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly resuserService: ResUserService,
    private readonly mafService: MfaService,
  ) { }

  // private verificationCodes = new Map<string, string>(); // 用于存储手机号和验证码的映射

  @ApiOperation({
    summary: '用户登陆',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @Post('/login')
  @HttpCode(200)
  login(@Body() user: LoginDto, @Request() req) {
    try {
      const agent = Useragent.parse(req.headers['user-agent']);
      const os = agent.os.toJSON().family;
      const browser = agent.toAgent();
      const clientInfo = {
        userAgent: req.headers['user-agent'],
        ipaddr: req.ip,
        browser: browser,
        os: os,
        loginLocation: '',
      };
      return this.mainService.login(user, clientInfo);
    } catch (err) {
      console.log('liginController---------------error-');
      console.log(err);

    }
  }

  @ApiOperation({
    summary: '退出登陆',
  })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @Post('/logout')
  @HttpCode(200)
  logout(@Request() req) {
    const agent = Useragent.parse(req.headers['user-agent']);
    const os = agent.os.toJSON().family;
    const browser = agent.toAgent();
    const clientInfo = {
      userAgent: req.headers['user-agent'],
      ipaddr: req.ip,
      browser: browser,
      os: os,
      loginLocation: '',
    };
    return this.mainService.logout(clientInfo);
  }

  @ApiOperation({
    summary: '用户注册',
  })
  @ApiBody({
    type: RegisterDto,
    required: true,
  })
  @Post('/register')
  @HttpCode(200)
  register(@Body() user: RegisterDto) {
    return this.mainService.register(user);
  }

  // 自定义函数 注册时发送短信验证码
  @ApiOperation({
    summary: '短信验证码',
  })
  @Post('/smscode')
  async smsCode(@Body() user: RegisterDto) {
    return this.mainService.smsCode(user);
  }

  @ApiOperation({
    summary: '用户信息',
  })
  @Get('/getInfo')
  async getInfo(@Request() req) {
    const user = req.user;
    // 定义前端api或路由的返回结果，把return的内容封装到request参数中
    return {
      msg: '操作成功',
      code: 200,
      permissions: user.permissions,
      roles: user.roles,
      user: user.user,
    };
  }

  @ApiOperation({
    summary: '路由信息',
  })
  @Get('/getRouters')
  getRouters(@Request() req) {
    const userId: string = req.user.user.id;
    return this.mainService.getRouters(+userId);
  }

  @ApiOperation({
    summary: 'odoo查询',
  })
  @Get('/moreinfo')
  async getEmployeeUserData() {
    // faceIdValid({
    //   IdCard: '500235200104145489',
    //   Name: '王令',
    // });
    // faceIdValidWithPeriod({
    //   IdCard: '500235200104145489',
    //   Name: '王令',
    //   ValidityBegin: '20160607',
    //   ValidityEnd: '20250607',
    // });
    // phoneStatus({
    //   Mobile: '15528434045',
    //   Encryption: {
    //     Algorithm: 'SM4-GCM',
    //   },
    // });
    // phoneValid({
    //   Type: '1', //0-手机号验证，1-身份证id、姓名认证
    //   Mobile: '15528434045',
    //   IdCard: '500235200104145489',
    //   Name: '王令',
    //   Encryption: {
    //     Algorithm: 'SM4-GCM',
    //   },
    // });
    // new OAmanageController().authenticate();
    // new OAmanageController().search([['active', '=', 'true']]);
    // new OAmanageController().list();
    // new OAmanageController().write(7, { name: '执业护士' });
    // new OAmanageController().create({ sequence: 10, company_id: 1, contract_type_id: 4, no_of_recruitment: 10, name: '医务秘书', department_id: 3 });
    // const employee = await this.userRepo
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.employee', 'hr') // 联合查询
    //   .where('user.id = :userId', { userId: 2 })
    //   .andWhere('user.active = :active', { active: true })
    //   .getOne();

    // const login = 'admin';
    // const employee = await this.userRepo
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.employee', 'hr') // 联合查询
    //   .where(`user.login LIKE '%${login}%'`)
    //   .getOne();

    // const employee = await this.userRepo
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.employee', 'hr')
    //   .where('user.login LIKE :login', { login: `%${login}%` })
    //   .andWhere('user.status = :status', { status })
    //   .orWhere('hr.department = :department', { department: 'IT' }) // 添加 OR 条件
    //   .getMany();

    // 如果需要指定查询内容的话应使用实体定义的字段
    // const employee = await this.employeeEntityRep.createQueryBuilder('hr').select(['hr.id', 'hr.departmentId', 'hr.name', 'hr.companyId']).where('hr.user_id = :userId', { userId: 2 }).getOne();

    // const employee = await this.deptEntityRep.createQueryBuilder('dept').leftJoinAndSelect('dept.employees', 'hr').where('dept.id = :userId', { userId: 4 });
    // const employee = await this.employeeEntityRep.createQueryBuilder('employee').leftJoinAndSelect('employee.department', 'dept').leftJoinAndSelect('employee.user', 'user').getManyAndCount();
    // let uid = 0;
    // employee.forEach((emp) => {
    //   uid = emp.userId;
    // });
    // const user = await this.userRepo.createQueryBuilder('user').where('user.id = :userId', { userId: uid }).getOne();
    // employee['user'] = user;

    // console.log('odoo data=', employee);
    // const employee = await this.employeeEntityRep.createQueryBuilder('hr').leftJoinAndSelect('hr.user', 'user').select('hr.userId').where('hr.userId  = :userId', { userId: 2 }).getMany();


    // const userIds = [2, 1907, 1908, 1909];
    // const employee = await this.userRepo
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.employee', 'hr')
    //   .leftJoinAndSelect('hr.department', 'dept')
    //   .where('user.id IN (:...userIds)', { userIds })
    //   .andWhere('user.active = :active', { active: true })
    //   .getMany();

    // const employee = await this.userRepo.createQueryBuilder('user').where('user.id = :id', { id: 2320 }).getOne();
    // const employee = await this.resuserService.findAll();
    // 插入数据
    // const employee = this.userWithcompanyEntityRep
    //   .createQueryBuilder('cu')
    //   .where('cu.userId IN (:...uid)', { uid: [2, 2338] })
    //   .getMany();
    // const compValues = {
    //   userId: 2,
    //   cid: 2,
    // };
    // employee.insert().values(compValues).execute();
    // const employee = await this.employeeEntityRep.createQueryBuilder('hr').where('hr.name LIKE :name', { name: 'nest' }).getOne();
    // if (employee) {
    //   if ((await employee).userId == 3) {
    //     // 处理查询结果
    //     (await employee).userId = 2293;
    //   }
    // }
    // // employee.userId = 3;
    // await this.employeeEntityRep.save(employee);
    //测试totp二维码url
    const user = new LoginDto();
    user.username = 'admin';
    user.password = 'odoo18';
    // const employee = this.mafService.createTotpcode(8, user);
    // const ress = this.mafService.disableTotp(1906);

    // 直接在Repository 上进行update操作
    // const employee = await this.userRepo.update(2, { rankId: 1 });
    // const employee = await this.userRepo.findOne({
    //   where: { login: 'admin' },
    // // });
    // const code = await this.mafService.createTotpcode(employee.id, employee);
    // const result = await this.mafService.validateTotp({ code: '123456', username: 'admin', firstValidate: true });
    // sendMsg('3372425446@qq.com', '15528434045', code.qrcode);
    return ResultData.ok(user, 'odoo查询成功');
  }
}
