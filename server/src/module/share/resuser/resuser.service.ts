import { Repository, In, Not, Like, Int32 } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
import { Response } from 'express';
import { GetNowDate, GenerateUUID, Uniq, ListToTree } from 'src/common/utils/index';
import { ExportTable } from 'src/common/utils/export';

import { CacheEnum, DelFlagEnum, StatusEnum, DataScopeEnum } from 'src/common/enum/index';
import { EMPLOYEE_USER_TYPE, LOGIN_TOKEN_EXPIRESIN, SYS_USER_TYPE } from 'src/common/constant/index';
import { ResultData } from 'src/common/utils/result';
import {
  CreateResUserDto,
  UpdateResUserDto,
  ListResUserDto,
  ChangeStatusDto,
  ResetPwdDto,
  AllocatedListDto,
  UpdateProfileDto,
  UpdatePwdDto,
  AuthUserCancelDto,
  AuthUserCancelAllDto,
  AuthUserSelectAllDto,
} from './dto/index';
import { RegisterDto, LoginDto, ClientInfoDto } from '../../main/dto/index';

import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';
import { HrDeptEntity } from '../hrdept/entities/hrdept.entity';
import { ConfigService } from 'src/module/system/config/config.service';
import { ResUserEntity } from './entities/resuser.entity';
import { HrEmpEntity } from './entities/hremp.entity';
import { SysUserWithRoleEntity } from 'src/module/system/user/entities/user-width-role.entity';
import { RoleService } from 'src/module/system/role/role.service';
import { SysRoleEntity } from 'src/module/system/role/entities/role.entity';
import { CompUserEntity } from './entities/comuserrel';
import { ResCompEntity } from './entities/rescompany.entity';
import { CryptoContext } from 'src/common/utils/sha512';
import { ResoureceEntity } from './entities/resource.entity';

@Injectable()
export class ResUserService {
  private pwdContext: CryptoContext;
  constructor(
    @InjectRepository(ResUserEntity, 'odoo18')
    private readonly userRepo: Repository<ResUserEntity>,
    @InjectRepository(HrDeptEntity, 'odoo18')
    private readonly deptEntityRep: Repository<HrDeptEntity>,
    @InjectRepository(HrEmpEntity, 'odoo18')
    private readonly employeeEntityRep: Repository<HrEmpEntity>,
    @InjectRepository(ResCompEntity, 'odoo18')
    private readonly companyEntityRep: Repository<ResCompEntity>,
    @InjectRepository(CompUserEntity, 'odoo18')
    private readonly userWithcompanyEntityRep: Repository<CompUserEntity>,
    @InjectRepository(ResoureceEntity, 'odoo18')
    private readonly resourceRep: Repository<ResoureceEntity>,
    @InjectRepository(SysUserWithRoleEntity)
    private readonly sysUserWithRoleEntityRep: Repository<SysUserWithRoleEntity>,
    @InjectRepository(SysRoleEntity)
    private readonly sysRoleEntityRep: Repository<SysRoleEntity>,
    private readonly deptService: HrDeptService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.pwdContext = new CryptoContext();
  }

  /**
   * 后台创建用户
   * 问题：实体or数据库中无法自动插入当前时间和状态值，只能代码插入
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateResUserDto, user: any) {
    const createDate = GetNowDate();
    if (createUserDto.password) {
      // createUserDto.password = await this.pwdContext.hash(createUserDto.password); //10.29 update
      createUserDto.password = await this.pwdContext.hashPassword(createUserDto.password);
    }
    // 如果用户/登录名已存在
    const iscz = await this.userRepo.find({
      where: {
        login: Like(createUserDto.login),
      },
    });
    if (iscz) {
      ResultData.fail(500, '用户已存在,请重新命名');
    }
    const newUser = new ResUserEntity();
    newUser.password = createUserDto.password;
    newUser.login = createUserDto.login;
    newUser.notificationType = 'email';
    // const res = await this.userRepo.save({ ...newUser, createDate, createUid: user.id, companyId: createUserDto.companyId, partnerId: 1 });
    const res = await this.userRepo.save({ ...newUser, createDate, createUid: user.userId, companyId: createUserDto.companyId, partnerId: 1 });

    // 还要处理一下有员工和无员工的问题
    const isexist = await this.employeeEntityRep.createQueryBuilder('hr').where('hr.name = :name', { name: createUserDto.name }).getOne();
    // 如果已有员工
    if (isexist) {
      // 如果存在员工但没绑定用户
      if (isexist.userId == null) {
        isexist.userId = res.id;
        await this.employeeEntityRep.save(isexist);
      }
      return ResultData.fail(500, '该员工已有账号,请重试');
    }

    const newResource = new ResoureceEntity();
    newResource.resourceType = 'user';
    newResource.userId = res.id;
    newResource.companyId = res.companyId;
    newResource.name = createUserDto.name;
    newResource.calendarId = 1;
    newResource.timeEfficiency = 100;
    newResource.tz = 'Asia/Shanghai';
    const resource = await this.resourceRep.save({ ...newResource, createDate, active: true, createUid: user.userId });

    const newEmp = new HrEmpEntity();
    newEmp.companyId = createUserDto.companyId;
    newEmp.departmentId = createUserDto.departmentId;
    newEmp.name = createUserDto.name;
    newEmp.workPhone = createUserDto.workPhone;
    newEmp.mobilePhone = createUserDto.mobilePhone;
    newEmp.gender = createUserDto.gender;
    newEmp.resourceCalendarId = resource.calendarId; //默认为上海时区
    newEmp.resourceId = resource.id;
    await this.employeeEntityRep.save({ ...newEmp, createDate, active: true, userId: res.id, employeeType: createUserDto.employeeType, createUid: user.userId });

    // 公司用户关系
    // const company = this.userWithcompanyEntityRep.createQueryBuilder('company');
    // const compValue = {
    //   userId: res.id,
    //   companyId: res.companyId,
    // };
    // company.insert().values(compValue).execute();
    const newRelation = new CompUserEntity();
    newRelation.userId = res.id;
    newRelation.cid = res.companyId;

    // 如果 cid 是自增的，不需要设置 cid
    await this.userWithcompanyEntityRep.save(newRelation);

    // 创建odoo user 与nest sys role记录
    const newUR = new SysUserWithRoleEntity();
    createUserDto.roles.forEach(async (role) => {
      newUR.roleId = role;
      newUR.userId = res.id;
      await this.sysUserWithRoleEntityRep.save({ ...newUR });
    });

    return ResultData.ok();
  }

  /**
   * 用户列表
   * @param query
   * @returns
   */
  async findAll(query: ListResUserDto, user: any) {
    try {
      const entity = this.userRepo.createQueryBuilder('user');
      entity.leftJoinAndSelect('user.employee', 'hr');
      // entity.where('user.avtive = :active', { active: true });

      // const [roles, count] = await this.sysUserWithRoleEntityRep.createQueryBuilder('role').getManyAndCount();

      //数据权限过滤
      if (user) {
        const roles = user.user.roles; //获取角色实体
        const deptIds = [];
        let dataScopeAll = false;
        let dataScopeSelf = false;
        for (let index = 0; index < roles.length; index++) {
          const role = roles[index];
          if (role.dataScope === DataScopeEnum.DATA_SCOPE_ALL) {
            dataScopeAll = true;
            break;
          } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM) {
            const roleWithDeptIds = await this.roleService.findRoleWithDeptIds(role.roleId);
            deptIds.push(...roleWithDeptIds);
          } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT || role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
            const dataScopeWidthDeptIds = await this.deptService.findDeptIdsByDataScope(user.employee.departmentId, role.dataScope);
            deptIds.push(...dataScopeWidthDeptIds);
          } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
            dataScopeSelf = true;
          }
        }

        // 如果不具备管理员权限
        if (!dataScopeAll) {
          if (deptIds.length > 0) {
            entity.where('hr.departmentId IN (:...deptIds)', { deptIds: deptIds });
          } else if (dataScopeSelf) {
            entity.where('user.id = :userId', { userId: user.id });
          }
        }
      }

      // 查询用户（部门树）
      if (query.departmentId) {
        // const deptIds = await this.deptService.findDeptIdsByDataScope(+query.departmentId, DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD);
        // console.log('查询=', deptIds);
        // entity.andWhere('hr.departmentId IN (:...deptIds)', { deptIds: deptIds });
        entity.andWhere('hr.departmentId = :departmentId', { departmentId: query.departmentId });
      }

      // 查询表单
      if (query.login) {
        entity.andWhere('user.login LIKE :login', { login: `%${query.login}%` });
      }

      if (query.workPhone) {
        entity.andWhere('hr.workPhone LIKE :workPhone', { workPhone: `%${query.workPhone}%` });
      }

      if (query.name) {
        entity.andWhere('hr.name LIKE :name', { name: `%${query.name}%` });
      }

      if (query.workEmail) {
        entity.andWhere('hr.name LIKE :workEmail', { name: `%${query.workEmail}%` });
      }

      if (query.active) {
        entity.andWhere('user.active = :active', { active: query.active });
      }

      if (query.params?.beginTime && query.params?.endTime) {
        entity.andWhere('user.createDate BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
      }

      if (query.pageSize && query.pageNum) {
        entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
      }
      //联查部门详情 .where('dept.id = hr.departmentId')
      entity.leftJoinAndSelect('hr.department', 'dept');
      // 非外键表联合查询 作为xxx属性，联合xxx实体，别名xxx,查询条件xxx
      entity.leftJoinAndMapOne('user.company', ResCompEntity, 'company', 'company.id = user.companyId');

      const [list, total] = await entity.getManyAndCount();
      // console.log('odoo user findall=', list, total);
      return ResultData.ok({
        list,
        total,
      });
    } catch (error) {
      console.log('error=', error);
      return ResultData.fail(500, error);
    }
  }

  /**
   * 部门->用户员工信息
   * @returns
   */
  async findEmpAndDeptAll() {
    const employee = await this.employeeEntityRep.find({
      where: {
        active: true,
      },
    });
    const department = await this.deptEntityRep.find({
      where: {
        available: true,
      },
    });

    return ResultData.ok({
      employee,
      department,
    });
  }

  // 查询用户详细（如修改按钮操作） api = getUser
  async findOne(userId: number) {
    //       .andWhere('user.active = :active', { active: true })
    const data = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.employee', 'hr')
      .leftJoinAndSelect('hr.department', 'dept')
      .where('user.id = :userId', { userId: userId })
      .getOne();

    const roleIds = await this.getRoleIds([userId]);
    const allRoles = await this.sysRoleEntityRep.createQueryBuilder('role').where('role.delFlag = :delFlag', { delFlag: '0' }).getMany();

    // 筛选出roleid指向的role对象存入data.roles
    data['roles'] = allRoles.filter((item) => roleIds.includes(item.roleId));
    let companys = null;
    const cu = await this.userWithcompanyEntityRep.createQueryBuilder('cu').where('cu.userId = :uid', { uid: userId }).getMany();
    const cIds = cu.map((item) => item.cid);
    // 10.30 update
    if (cu && cIds.length > 0) {
      const cIds = cu.map((item) => item.cid);
      companys = await this.companyEntityRep.createQueryBuilder('comp').where('comp.id IN (:...cIds)', { cIds }).getMany();
    }
    // 如果没建立外部连接但用户公司信息已存在
    else if (data.companyId) {
      const newRelation = new CompUserEntity();
      newRelation.userId = userId;
      newRelation.cid = data.companyId;
      const com = await this.userWithcompanyEntityRep.save(newRelation);
      companys = await this.companyEntityRep.createQueryBuilder('comp').where('comp.id = :cid', { cid: com.cid }).getOne();
    }
    // 这里的roles是与data同级的role id,data内部还有个子级rolrs，是role详情
    return ResultData.ok({
      data,
      roles: roleIds,
      companyIds: cIds,
      companys: companys,
    });
  }

  /**
   * 系统角色信息 切换odoo用户后没有岗位 待添加or修改功能
   * @returns
   */
  async findRoleAll() {
    const roles = await this.sysRoleEntityRep.createQueryBuilder('role').where('role.delFlag = :delFlag', { delFlag: '0' }).getMany();
    return ResultData.ok({
      roles,
    });
  }

  /**更新用户
   * @param updateUserDto
   * @returns
   */
  async update(updateUserDto: UpdateResUserDto, userId: number, roles: number[]) {
    //不具有管理员权限的用户无权限 好像已经在controller层添加权限设定了
    const superadmin = 1;
    if (!roles.includes(superadmin)) {
      throw new BadRequestException('非管理员不可操作！');
    }
    //不能修改超级管理员
    if (updateUserDto.id === 2) throw new BadRequestException('非法操作！');
    //当前用户不能修改自己的状态
    if (updateUserDto.id === userId) {
      delete updateUserDto.active;
    }
    // 处理角色绑定
    if (updateUserDto?.roles?.length > 0) {
      //如果用户已有角色,先删除所有关联角色
      const hasRoletId = await this.sysUserWithRoleEntityRep.findOne({
        where: {
          userId: updateUserDto.id,
        },
        select: ['roleId'],
      });
      if (hasRoletId) {
        await this.sysUserWithRoleEntityRep.delete({
          userId: updateUserDto.id,
        });
      }
      // 再创建角色绑定
      const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
      const roleValues = updateUserDto.roles.map((roleId) => {
        return {
          userId: updateUserDto.id,
          roleId: roleId,
        };
      });
      roleEntity.insert().values(roleValues).execute();
    }

    // 处理前端传过来的数据 对一些不必要的字段进行删除
    // delete updateUserDto.password;
    // delete (updateUserDto as any).departmentId;
    delete (updateUserDto as any).roles;
    // delete (updateUserDto as any).id;
    delete (updateUserDto as any).login;
    //更新用户信息
    console.log('updateUserDto=', updateUserDto);
    const data = await this.employeeEntityRep.update(
      { userId: updateUserDto.id },
      {
        departmentId: updateUserDto.departmentId,
        companyId: updateUserDto.companyId,
        workPhone: updateUserDto.workPhone,
        // mobilePhone: updateUserDto.workPhone,
        workEmail: updateUserDto.workEmail,
        gender: updateUserDto.gender,
        employeeType: updateUserDto.employeeType,
        marital: updateUserDto.marital,
      },
    );
    await this.userRepo.update(
      { id: updateUserDto.id },
      {
        companyId: updateUserDto.companyId,
      },
    ); //正确返回内容应为：{ generatedMaps: [], raw: [], affected: 1 }
    return ResultData.ok(data);
  }

  /**
   * 登陆
   */
  async login(user: LoginDto, clientInfo: ClientInfoDto) {

    const data = await this.userRepo.createQueryBuilder('user').select(['user.id', 'user.password']).where('user.login = :login', { login: user.username }).getOne();

    if (!data) {
      return ResultData.fail(500, '系统中不存在该用户，请先注册');
    }
    try {
      const result = await this.pwdContext.verifyPasslib(user.password, data.password);
      if (!result) {
        return ResultData.fail(500, `密码错误,请重新输入`);
      }
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, `server error`);
    }

    const userData = await this.getUserinfo(data.id);
    if (userData.active === false) {
      return ResultData.fail(500, `您已被禁用，如需正常使用请联系管理员`);
    }
    console.log(userData);

    const loginDate = new Date();

    // 为登录用户分配token
    const uuid = GenerateUUID();
    const token = this.createToken({ uuid: uuid, userId: userData.id });
    // 绝对不能删，否则会报错undefined "includes",是权限的内容
    const permissions = await this.getUserPermissions(userData.id);
    const roleIds = await this.getRoleIds([userData.id]);
    const metaData = {
      browser: clientInfo.browser,
      ipaddr: clientInfo.ipaddr,
      loginLocation: clientInfo.loginLocation,
      loginTime: loginDate,
      os: clientInfo.os,
      token: uuid,
      user: userData,
      permissions: permissions,
      roles: roleIds,
      userId: userData.id,
      login: userData.login,
      deptName: userData.employee?.department?.name?.zh_CN || '无',
    };

    // 缓存登录信息到redis
    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${uuid}`, metaData, LOGIN_TOKEN_EXPIRESIN);
    const loginuser = user.username;
    return ResultData.ok(
      {
        token,
        loginuser, //返回登录用户，以便totp获取验证对象
      },

      '登录成功',
    );
  }

  /**
   * 获取权限列表
   * @param userId
   * @returns
   */
  async getUserPermissions(userId: number) {
    // 超级管理员（初始权限最大user）  res_users 2 为admin
    if (userId === 2) {
      return ['*:*:*'];
    }
    //如果为超级管理员
    const superadmin = 1;
    const roleIds = await this.getRoleIds([userId]);
    if (roleIds.includes(superadmin)) {
      return ['*:*:*'];
    }
    const list = await this.roleService.getPermissionsByRoleIds(roleIds);
    const permissions = Uniq(list.map((item) => item.perms)).filter((item) => item.trim());
    console.log(
      '获取权限=',
      userId,
      roleIds,
      // list.forEach((item) => item.menuName),
    );
    return permissions;
  }

  /**
   * 获取角色Id列表
   * @param userId
   * 返回【roleids】
   * @returns
   */
  async getRoleIds(userId: Array<number>) {
    const roleList = await this.sysUserWithRoleEntityRep.find({
      where: {
        userId: In(userId),
      },
      select: ['roleId'],
    });
    // 转化为数组保存 uniq是去重
    const roleIds = roleList.map((item) => item.roleId);
    return Uniq(roleIds);
  }

  /**
   * 获取用户信息 传入用户表id
   */
  async getUserinfo(userId: number): Promise<{ department: HrDeptEntity; role: Array<SysRoleEntity>; employee: Array<HrEmpEntity> } & ResUserEntity> {
    const entity = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .where('user.id = :userId', { userId: userId });
    const data: any = await entity.getOne();
    let companys = null;

    const roleIds = await this.getRoleIds([userId]);

    const roles = await this.sysRoleEntityRep.createQueryBuilder('role').where('role.roleId IN (:...roleIds)', { roleIds }).andWhere('role.delFlag = :delFlag', { delFlag: '0' }).getMany();
    // 单公司与多公司处理
    // companys = await this.companyEntityRep.createQueryBuilder('company').where('company.id = :userId', { userId: data.companyId }).getOne();
    const cu = await this.userWithcompanyEntityRep.createQueryBuilder('cu').where('cu.userId = :uid', { uid: userId }).getMany();
    const cIds = cu.map((item) => item.cid);
    if (cu && cIds.length > 1) {
      const cIds = cu.map((item) => item.cid);
      companys = await this.companyEntityRep.createQueryBuilder('comp').where('comp.id IN (:...cIds)', { cIds }).getMany();
    }
    // else {
    //   companys = await this.companyEntityRep.createQueryBuilder('comp').where('comp.id = :cIds', { cIds }).getOne();
    // }

    data['roles'] = roles; //添加一个子级属性 这边返回到前端后数据结构为user:{user的属性，employee:{employee的属性，department:{department的属性}},role:{role的属性}}
    data['companys'] = companys;

    return data;
  }

  /**
   * 注册
   * res_user表没有phone 因此需要和employee联查
   * 注册新用户时代码还需完善，目前只处理了user创建时与odoo employee和nest role的关系，odoo中user 与 company的关系还未处理（有rel外部表，完整保存了用户的公司信息）
   */
  async register(user: RegisterDto) {
    const writeDate = GetNowDate();
    const createDate = GetNowDate();
    const saveUser = new ResUserEntity();
    saveUser.login = user.username;
    saveUser.password = await this.pwdContext.hashPassword(user.password);
    saveUser.companyId = 1;
    saveUser.partnerId = 2;
    saveUser.notificationType = 'email';
    console.log('register user pass=', saveUser.password);

    //短信验证码  redis key=tel code=code
    let verified = await this.configService.getConfigValue('sys.account.verified');
    const smscode = await this.redisService.get(CacheEnum.CAPTCHA_CODE_KEY + user.phonenumber);
    if (user.code === smscode) {
      verified = true;
    }
    const ok: boolean = verified === true;
    if (!ok) {
      return ResultData.fail(500, '验证码错误');
    }

    const checkUserNameUnique = await this.userRepo.findOne({
      where: {
        login: user.username,
      },
      select: ['login'],
    });
    if (checkUserNameUnique) {
      return ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
    }
    const nu = await this.userRepo.save({ ...saveUser, writeDate, createDate });
    await this.userRepo.update({ id: nu.id }, { partnerId: nu.id });

    const emp = new HrEmpEntity();
    emp.user = nu;
    emp.workPhone = user.phonenumber;
    emp.resourceId = 1;
    emp.companyId = 1;
    emp.name = user.username;
    emp.userId = nu.id;
    emp.active = true;
    await this.employeeEntityRep.save({ ...emp, writeDate, createDate, employeeType: EMPLOYEE_USER_TYPE.EMPLOYEE, createUid: nu.id });
    await this.sysUserWithRoleEntityRep.save({ userId: nu.id, roleId: 2 });
    return ResultData.ok(nu, '注册成功');
  }

  /**
   * 从数据声明生成令牌
   *
   * @param payload 数据声明
   * @return 令牌
   */
  createToken(payload: { uuid: string; userId: number }): string {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  /**
   * 从令牌中获取数据声明
   *
   * @param token 令牌
   * @return 数据声明
   */
  parseToken(token: string) {
    try {
      if (!token) return null;
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 重置密码
   * @param body
   * @returns
   */
  async resetPwd(body: ResetPwdDto) {
    if (body.id === 2) {
      return ResultData.fail(500, '系统用户不能重置密码');
    }
    if (body.password) {
      body.password = await this.pwdContext.hashPassword(body.password);
    }
    await this.userRepo.update(
      {
        id: body.id,
      },
      {
        password: body.password,
      },
    );
    return ResultData.ok();
  }

  /**
   * 批量删除用户
   * @param ids
   * @returns
   */
  async remove(ids: number[]) {
    // 忽略系统角色的删除
    const data = await this.userRepo.update(
      { id: In(ids) },
      {
        active: false,
      },
    );
    return ResultData.ok(data);
  }

  /**
   * 角色详情
   * @param id
   * @returns
   */
  async authRole(userId: number) {
    const allRoles = await this.roleService.findRoles({
      where: {
        delFlag: '0',
      },
    });
    const user = await this.userRepo.createQueryBuilder('user').where('user.id = :id', { id: userId }).getOne();

    const roleIds = await this.getRoleIds([userId]);

    const roles = await this.sysRoleEntityRep.createQueryBuilder('role').where('role.roleId IN (:...roleIds)', { roleIds }).andWhere('role.delFlag = :delFlag', { delFlag: '0' }).getMany();
    user['roles'] = roles;

    //TODO flag用来给前端表格标记选中状态，后续优化
    user['roles'] = allRoles.filter((item) => {
      if (roleIds.includes(item.roleId)) {
        item['flag'] = true;
        return true;
      } else {
        return true;
      }
    });

    return ResultData.ok({
      roles: allRoles,
      user,
    });
  }

  /**
   * 更新用户角色信息
   * @param query
   * @returns
   */
  async updateAuthRole(query) {
    const roleIds = query.roleIds.split(',');
    if (roleIds?.length > 0) {
      //用户已有角色,先删除所有关联角色
      const hasRoletId = await this.sysUserWithRoleEntityRep.findOne({
        where: {
          userId: query.userId,
        },
        select: ['roleId'],
      });
      if (hasRoletId) {
        await this.sysUserWithRoleEntityRep.delete({
          userId: query.userId,
        });
      }
      const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
      const roleValues = roleIds.map((id) => {
        return {
          userId: query.userId,
          roleId: id,
        };
      });
      roleEntity.insert().values(roleValues).execute();
    }
    return ResultData.ok();
  }

  /**
   * 修改用户状态
   * @param changeStatusDto
   * @returns
   */
  async changeStatus(changeStatusDto: ChangeStatusDto) {
    console.log('进入后端服务changeUserStatus:');
    try {
      const urData = await this.sysUserWithRoleEntityRep.findOne({
        where: {
          userId: changeStatusDto.id,
        },
        select: ['roleId'],
      });
      if (urData.roleId === 1) {
        return ResultData.fail(500, '系统管理员不可停用');
      }

      const res = await this.userRepo.update(
        { id: changeStatusDto.id },
        {
          active: changeStatusDto.active,
        },
      );
      // const res = await this.userRepo.createQueryBuilder('user').update(ResUserEntity).set({ active: changeStatusDto.active }).where('user.id = :id', { id: changeStatusDto.id }).execute();
      console.log('后端changeUserStatus update user=', res);
      return ResultData.ok(res);
    } catch (error) {
      return ResultData.fail(500, error);
    }
  }

  /**
   * 部门树
   * @returns
   */
  async deptTree() {
    try {
      const tree = await this.deptService.deptTree();
      return ResultData.ok(tree);
    } catch (error) {
      console.log(error);
      ResultData.fail(500, error);
    }
  }

  /**
   * 公司树
   * @returns
   */
  async compTree() {
    try {
      const res = await this.companyEntityRep.find({
        where: {
          active: true,
        },
      });
      const tree = ListToTree(
        res,
        (m) => m.id,
        (m) => m.name,
      );
      return ResultData.ok(tree);
    } catch (error) {
      console.log(error);
      ResultData.fail(500, error);
    }
  }

  /**
   * 获取角色已分配用户
   * @param query
   * @returns
   */
  async allocatedList(query: AllocatedListDto) {
    const roleWidthRoleList = await this.sysUserWithRoleEntityRep.find({
      where: {
        roleId: +query.roleId,
      },
      select: ['userId'],
    });
    if (roleWidthRoleList.length === 0) {
      return ResultData.ok({
        list: [],
        total: 0,
      });
    }
    const userIds = roleWidthRoleList.map((item) => item.userId);
    //联查部门详情
    const hr = await this.employeeEntityRep
      .createQueryBuilder('hr')
      .leftJoinAndSelect('hr.user', 'user')
      .leftJoinAndSelect('hr.department', 'dept')
      .where('user.id IN (:... ids)', { ids: userIds })
      .andWhere('user.active = :active', { active: true });
    if (query.login) {
      hr.andWhere(`user.login LIKE "%${query.login}%"`);
    }
    if (query.companyId) {
      hr.andWhere(`user.companyId LIKE "%${query.companyId}%"`);
    }
    hr.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);

    const [list, total] = await hr.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 获取未分配角色用户
   * @param query
   * @returns
   */
  async unallocatedList(query: AllocatedListDto) {
    const roleWidthRoleList = await this.sysUserWithRoleEntityRep.find({
      where: {
        roleId: +query.roleId,
      },
      select: ['userId'],
    });

    const userIds = roleWidthRoleList.map((item) => item.userId);
    const entity = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.employee', 'hr')
      .leftJoinAndSelect('hr.department', 'dept')
      .where('user.id Not IN (:... ids)', { ids: userIds })
      .andWhere('user.active = :active', { active: true });

    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    const [list, total] = await entity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 用户解绑角色
   * @param data
   * @returns
   */
  async authUserCancel(data: AuthUserCancelDto) {
    await this.sysUserWithRoleEntityRep.delete({
      userId: data.userId,
      roleId: data.roleId,
    });
    return ResultData.ok();
  }

  /**
   * 用户批量解绑角色
   * @param data
   * @returns
   */
  async authUserCancelAll(data: AuthUserCancelAllDto) {
    const userIds = data.userIds.split(',').map((id) => +id);
    await this.sysUserWithRoleEntityRep.delete({
      userId: In(userIds),
      roleId: +data.roleId,
    });
    return ResultData.ok();
  }

  /**
   * 用户批量绑定角色
   * @param data
   * @returns
   */
  async authUserSelectAll(data: AuthUserSelectAllDto) {
    const userIds = data.userIds.split(',');
    const entitys = userIds.map((userId) => {
      const sysDeptEntityEntity = new SysUserWithRoleEntity();
      return Object.assign(sysDeptEntityEntity, {
        userId: userId,
        roleId: +data.roleId,
      });
    });
    await this.sysUserWithRoleEntityRep.save(entitys);
    return ResultData.ok();
  }

  /**
   * 个人中心-用户信息
   * @param user
   * @returns
   */
  async profile(user) {
    try {
      return ResultData.ok(user);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 个人中心-用户信息
   * @param user
   * @returns
   */
  async updateProfile(user: any, updateProfileDto: UpdateProfileDto) {
    // await this.userRepo.update({ id: user.user.id }, { login: updateProfileDto.login });
    // delete updateProfileDto.login;
    await this.employeeEntityRep.update(
      { id: user.user.id },
      { name: updateProfileDto.name, workEmail: updateProfileDto.workEmail, workPhone: updateProfileDto.workPhone, gender: updateProfileDto.gender },
    );
    const userData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`);
    userData.user.name = updateProfileDto.name;
    userData.user.email = updateProfileDto.workEmail;
    userData.user.phonenumber = updateProfileDto.workPhone;
    userData.user.sex = updateProfileDto.gender;
    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`, userData);
    return ResultData.ok();
  }

  /**
   * 个人中心-修改密码
   * @param user
   * @param updatePwdDto
   * @returns
   */
  async updatePwd(user: any, updatePwdDto: UpdatePwdDto) {
    if (updatePwdDto.oldPassword === updatePwdDto.newPassword) {
      return ResultData.fail(500, '新密码不能与旧密码相同');
    }
    const valid = await this.pwdContext.verifyPasslib(updatePwdDto.oldPassword, user.user.password);
    if (valid) {
      const hashPassword = await this.pwdContext.hashPassword(updatePwdDto.newPassword);
      await this.userRepo.update({ id: user.userId }, { password: hashPassword });
      return ResultData.ok();
    } else {
      return ResultData.fail(500, '修改密码失败，旧密码错误');
    }
  }

  /**
   * 导出用户信息数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListResUserDto, user) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body, user);
    const options = {
      sheetName: '用户数据',
      data: list.data.list,
      header: [
        { title: '用户序号', dataIndex: 'id' },
        { title: '登录名称', dataIndex: 'login' },
        { title: '用户昵称', dataIndex: 'employee.name' },
        { title: '用户邮箱', dataIndex: 'employee.workEmail' },
        { title: '手机号码', dataIndex: 'employee.workPhone' },
        { title: '用户性别', dataIndex: 'employee.gender' },
        { title: '员工类型', dataIndex: 'employee.employeeType' },
        { title: '婚姻状况', dataIndex: 'employee.marital' },
        { title: '职务', dataIndex: 'employee.jobTitle' },
        { title: '账号状态', dataIndex: 'active' },
        { title: '最后登录IP', dataIndex: 'loginIp' },
        { title: '最后登录时间', dataIndex: 'createDate', width: 20 },
        { title: '部门', dataIndex: 'department.name' },
        { title: '部门负责人', dataIndex: 'department.dutyId' },
      ],
    };
    ExportTable(options, res);
  }
}

// 以下是废弃密码
/**
 * function genSalt() {
  return randomBytes(16).toString('hex');
}

function hashPwd(password: string, salt: string, iterations: any) {
  // const sa = createHash('pbkdf2-sha512');
  // const key = pbkdf2Sync(password, saltt, iterations, 64, 'sha512').toString('base64');
  const key = pbkdf2Sync(password, salt, iterations, 64, 'sha512');

  // const hashedPwd = `$pbkdf2-sha512$${iterations}$${Buffer.from(saltt).toString('base64')}$${key}`;
  const hashedPwd = `$pbkdf2-sha512$${iterations}$${Buffer.from(salt, 'hex').toString('base64')}$${key.toString('base64')}`;

  console.log('new pass=', salt, hashedPwd);
  return hashedPwd;
}

function verifyPwd(password: string, salt: string, hashPassword: string) {
  const result = hashPwd(password, salt, 600000) === hashPassword;
  return result;
}
 */
