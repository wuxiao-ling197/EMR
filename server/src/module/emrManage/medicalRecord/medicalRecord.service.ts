import { Repository, In, Not } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
import { Response } from 'express';
import { ExportTable } from 'src/common/utils/export';

import { DelFlagEnum, DataScopeEnum } from 'src/common/enum/index';
import { ResultData } from 'src/common/utils/result';
import { CreateMedicalRecordDto, ListMedicalRecordDto, ChangeStatusDto } from './dto/index';
import { MedicalRecordEntity } from './entities/emr-medical-record.entity';
import { pbkdf2Sync } from 'crypto';
import { AxiosService } from 'src/module/axios/axios.service';
import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';

// import { generateJobId } from 'src/common/utils/generator';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecordEntity, 'odoo18')
    private readonly MedicalRecordRepo: Repository<MedicalRecordEntity>,
    private readonly deptService: HrDeptService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    // private readonly configService: ConfigService,
    private readonly axiosService: AxiosService,
  ) { }

  async generateID(params?: any) {
    // 生成jobID
    const keyPrefix = params || 'job_id_'
    try {
      const jobId = await this.redisService.generateID(keyPrefix);
      console.log('-------testJobId------::', jobId);
      return jobId + ''
      // return ResultData.ok(jobId);
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * 创建病历
   * @param createMedicalRecordDto
   * @returns
   */
  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    console.log('=====================createMR=====');

    console.log(createMedicalRecordDto);
    const writeDate = new Date();
    const createDate = new Date();
    // if(createMedicalRecordDto.payload && createMedicalRecordDto.header){
    let payload = createMedicalRecordDto.payload
    let header = createMedicalRecordDto.header
    let participants = createMedicalRecordDto.participants
    const emr: MedicalRecordEntity = {
      ...createMedicalRecordDto,
      header,
      participants,
      payload,
      writeDate,
      // 暂定固定属性
      id: 100,
      createDate,
    };
    delete emr.id; // 仅在 id 是自动生成的并且不应该在创建时设置时添加此行
    try {
      const res = await this.MedicalRecordRepo.save(emr);
      return ResultData.ok(res);
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, 'Failed to create template');
    }
  }

  /**
   * 病历列表
   * @param query
   * @returns
   */
  // async findAll(query: ListMedicalRecordDto) {
  async findAll(query: any) {
    console.log('---------findAllMedicalRecord----------');
    console.log(query);
    const medicalRecord = await this.MedicalRecordRepo.find()
    return ResultData.ok(medicalRecord);
  }

  /**
   * 查找患者病历
   * @param patient 
   */
  async findPatientMR(patientID: any) {
    const medicalRecord = this.MedicalRecordRepo.createQueryBuilder('medicalRecord');
    medicalRecord.where('medicalRecord.patient_id = :patientID', { patientID: patientID });
    const list = await medicalRecord.getMany();
    console.log(list);
    // return list
    return ResultData.ok(list);
  }

  /**
   * 用户角色+岗位信息
   * @returns
   */
  // async findPostAndRoleAll() {
  // const posts = await this.sysPostEntityRep.find({
  //   where: {
  //     delFlag: '0',
  //   },
  // });
  // const roles = await this.roleService.findRoles({
  //   where: {
  //     delFlag: '0',
  //   },
  // });

  // return ResultData.ok({
  //   posts,
  //   roles,
  // });
  // }


  /**
   * 更新病历（更新不了，应该是直接添加（create））
   * @param updateMedicalRecordDto
   * @returns
   */
  // async update(updateMedicalRecordDto: UpdateMedicalRecordDto, MedicalRecordId: number) {
  //   //不能修改超级管理员
  //   if (updateMedicalRecordDto.MedicalRecordId === 1) throw new BadRequestException('非法操作！');

  //   //过滤掉设置超级管理员角色
  //   updateMedicalRecordDto.roleIds = updateMedicalRecordDto.roleIds.filter((v) => v !== 1);

  //   //当前用户不能修改自己的状态
  //   if (updateMedicalRecordDto.MedicalRecordId === MedicalRecordId) {
  //     delete updateMedicalRecordDto.status;
  //   }

  //   if (updateMedicalRecordDto?.postIds?.length > 0) {
  //     //用户已有岗位,先删除所有关联岗位
  //     const hasPostId = await this.sysMedicalRecordWithPostEntityRep.findOne({
  //       where: {
  //         MedicalRecordId: updateMedicalRecordDto.MedicalRecordId,
  //       },
  //       select: ['postId'],
  //     });

  //     if (hasPostId) {
  //       await this.sysMedicalRecordWithPostEntityRep.delete({
  //         MedicalRecordId: updateMedicalRecordDto.MedicalRecordId,
  //       });
  //     }
  //     const postEntity = this.sysMedicalRecordWithPostEntityRep.createQueryBuilder('postEntity');
  //     const postValues = updateMedicalRecordDto.postIds.map((id) => {
  //       return {
  //         MedicalRecordId: updateMedicalRecordDto.MedicalRecordId,
  //         postId: id,
  //       };
  //     });
  //     postEntity.insert().values(postValues).execute();
  //   }

  //   if (updateMedicalRecordDto?.roleIds?.length > 0) {
  //     //用户已有角色,先删除所有关联角色
  //     const hasRoletId = await this.sysMedicalRecordWithRoleEntityRep.findOne({
  //       where: {
  //         MedicalRecordId: updateMedicalRecordDto.MedicalRecordId,
  //       },
  //       select: ['roleId'],
  //     });
  //     if (hasRoletId) {
  //       await this.sysMedicalRecordWithRoleEntityRep.delete({
  //         MedicalRecordId: updateMedicalRecordDto.MedicalRecordId,
  //       });
  //     }
  //     const roleEntity = this.sysMedicalRecordWithRoleEntityRep.createQueryBuilder('roleEntity');
  //     const roleValues = updateMedicalRecordDto.roleIds.map((id) => {
  //       return {
  //         MedicalRecordId: updateMedicalRecordDto.MedicalRecordId,
  //         roleId: id,
  //       };
  //     });
  //     roleEntity.insert().values(roleValues).execute();
  //   }

  //   delete updateMedicalRecordDto.password;
  //   delete (updateMedicalRecordDto as any).dept;
  //   delete (updateMedicalRecordDto as any).roles;
  //   delete (updateMedicalRecordDto as any).roleIds;
  //   delete (updateMedicalRecordDto as any).postIds;

  //   //更新用户信息
  //   // updateMedicalRecordDto.updateTime = new Date();
  //   const data = await this.MedicalRecordRepo.update({ MedicalRecordId: updateMedicalRecordDto.MedicalRecordId }, updateMedicalRecordDto);
  //   return ResultData.ok(data);
  // }

  /**
   * 获取病历信息
   * 但不是通过病历的id，而是通过患者id（patient）获取所有病历（列表）
   */
  // async getMedicalRecordinfo(MedicalRecordId: number): Promise<{ dept: SysDeptEntity; roles: Array<any>; posts: Array<SysPostEntity> } & MedicalRecordEntity> {
  //   const entity = this.MedicalRecordRepo.createQueryBuilder('MedicalRecord');
  //   entity.where({
  //     MedicalRecordId: MedicalRecordId,
  //     delFlag: DelFlagEnum.NORMAL,
  //   });
  //   //联查部门详情
  //   entity.leftJoinAndMapOne('MedicalRecord.dept', SysDeptEntity, 'dept', 'dept.deptId = MedicalRecord.deptId');
  //   const roleIds = await this.getRoleIds([MedicalRecordId]);

  //   const roles = await this.roleService.findRoles({
  //     where: {
  //       delFlag: '0',
  //       roleId: In(roleIds),
  //     },
  //   });

  //   const postIds = (
  //     await this.sysMedicalRecordWithPostEntityRep.find({
  //       where: {
  //         MedicalRecordId: MedicalRecordId,
  //       },
  //       select: ['postId'],
  //     })
  //   ).map((item) => item.postId);

  //   const posts = await this.sysPostEntityRep.find({
  //     where: {
  //       delFlag: '0',
  //       postId: In(postIds),
  //     },
  //   });

  //   const data: any = await entity.getOne();
  //   data['roles'] = roles;
  //   data['posts'] = posts;
  //   return data;
  // }

  /**
   * 停用病历
   * @param changeStatusDto 
   */
  async changeStatus(changeStatusDto: any) {

  }
  /**
   * 批量删除病历（删不了，应该是修改某一个状态值为不可查询或者其他）
   * @param ids
   * @returns
   */
  async remove(ids: number[]) {
    // 忽略系统角色的删除
    // const data = await this.MedicalRecordRepo.update(
    //   { MedicalRecordId: In(ids), MedicalRecordType: Not(SYS_MedicalRecord_TYPE.SYS) },
    //   {
    //     delFlag: '1',
    //   },
    // );
    // return ResultData.ok(data);
  }

  /**
   * 导出病历信息数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListMedicalRecordDto, MedicalRecord) {
    //   delete body.pageNum;
    //   delete body.pageSize;
    //   const list = await this.findAll(body, MedicalRecord);
    //   const options = {
    //     sheetName: '用户数据',
    //     data: list.data.list,
    //     header: [
    //       { title: '用户序号', dataIndex: 'MedicalRecordId' },
    //       { title: '登录名称', dataIndex: 'MedicalRecordName' },
    //       { title: '用户昵称', dataIndex: 'nickName' },
    //       { title: '用户邮箱', dataIndex: 'email' },
    //       { title: '手机号码', dataIndex: 'phonenumber' },
    //       { title: '用户性别', dataIndex: 'sex' },
    //       { title: '账号状态', dataIndex: 'status' },
    //       { title: '最后登录IP', dataIndex: 'loginIp' },
    //       { title: '最后登录时间', dataIndex: 'loginDate', width: 20 },
    //       { title: '部门', dataIndex: 'dept.deptName' },
    //       { title: '部门负责人', dataIndex: 'dept.leader' },
    //     ],
    //   };
    //   ExportTable(options, res);
  }
}

// function hashPwd(password: string, salt: string, iterations: any) {
//   const key = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('base64');
//   const hashedPwd = `$pbkdf2-sha512$${iterations}$${Buffer.from(salt).toString('base64')}$${key}`;
//   return hashedPwd;
// }

// function verifyPwd(password: string, hashPassword: string) {
//   return hashPwd(password, password, 600000) === hashPassword;
// }
