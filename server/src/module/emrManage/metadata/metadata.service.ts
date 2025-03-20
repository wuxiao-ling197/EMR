import { Repository, DataSource, In, Not } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
// import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
import { Response } from 'express';
import { ExportTable } from 'src/common/utils/export';

import { DelFlagEnum, DataScopeEnum } from 'src/common/enum/index';
import { ResultData } from 'src/common/utils/result';
import { CreateMetadataDto, ListMetadataDto, ChangeStatusDto, SelectFieldListDto, DatasourceFeildDto } from './dto/index';
import { MetadataEntity } from './entities/emr-metadata.entity';
// import { SysMetadataWithPostEntity } from './entities/metadata-width-post.entity-width-post.entity';
// import { SysMetadataWithRoleEntity } from './entities/metadata-width-role.entity-width-role.entity';
// import { SysPostEntity } from '../post/entities/post.entity';
// import { SysDeptEntity } from '../dept/entities/dept.entity';
// import { RoleService } from '../role/role.service';
// import { DeptModule } from '../dept/dept.service';
// import { ConfigService } from '../config/config.service';
import { pbkdf2Sync } from 'crypto';
import { AxiosService } from 'src/module/axios/axios.service';
import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';

import { JwtService } from '@nestjs/jwt';


@Injectable()
export class MetadataService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(MetadataEntity, 'odoo18')
    private readonly MetadataRepo: Repository<MetadataEntity>,
  ) { }
  /**
   * 获取所有实体的元数据
   */
  async getField() {
    const metadatas = this.dataSource.entityMetadatas;
    const list = [];
    metadatas.forEach((metadata, index) => {
      const fields: { fieldName: string; fieldLabel: string }[] = [];
      // patientMetadata.columns.forEach((column: ObjectLiteral) => {
      metadata.columns.forEach((column: ObjectLiteral) => {
        fields.push({
          fieldName: column.propertyName, // 这通常是TypeScript类中的属性名
          fieldLabel: column.comment || column.propertyName, // 如果没有comment，则使用属性名作为label
        });
      });

      list.push({
        id: index + 1,
        comment: metadata.comment,
        tableName: metadata.tableName,
        fields
      })
    })
    // 注意：如果你需要数据库中的实际列名而不是TypeScript属性名，你应该使用column.databaseName
    // 但这通常不是前端表单所需的，因为前端代码是基于TypeScript实体类编写的。
    const total = metadatas.length;
    return ResultData.ok({
      list,
      total
    });
  }

  /**
   * 获取单个实体的元数据
   * 实际上应该是根据传递的name参数来获取某个实体的元数据
   */
  async getPatientEntityField(data: { entityComment?: string, columnComments?: Array<any>, }) {
    { }
    const metadatas = this.dataSource.entityMetadatas;
    const fieldList: DatasourceFeildDto[] = [];
    let { entityComment, columnComments } = data
    console.log('entityComment:::', entityComment);
    // 根据实体名字生成fields
    if (entityComment) {
      // 如果有comment参数，就遍历所有实体，找到表名或者comment对得上的实体，获取元数据
      metadatas.forEach((metadata, index) => {
        if (metadata.comment === entityComment) {
          metadata.columns.forEach((column: ObjectLiteral) => {
            fieldList.push({
              fieldName: column.propertyName, // 这通常是TypeScript类中的属性名
              fieldLabel: column.comment || column.propertyName, // 如果没有comment，则使用属性名作为label
            });
          });
        }
      })
      return fieldList;
    } else if (columnComments) {

    } else {
      // 没有comment参数，可能根据其他字段判断实体
      console.error('缺少参数');
      return ResultData.fail(300, '缺少参数')
    }
  }

  /**
   * 查询数据源值域大类列表
   * @param query
   * @returns
   */
  async findCategory() {
    const metadata = this.MetadataRepo.createQueryBuilder('Metadata');
    metadata.select(['Metadata.categoryCode', 'Metadata.category']);
    // .getMany();
    // const  = await metadata.getMany();
    const Lists = await metadata.getMany();

    const list = []
    const seen = new Map<string, boolean>();
    Lists.forEach(item => {
      const key = `${item.category}-${item.categoryCode}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        list.push(item);
      }
    });
    const total = list.length;
    // const list = await this.MetadataRepo.find({
    //   where: {},
    //   select: ['categoryCode', 'category'],
    // });
    // return metadata;
    return ResultData.ok({
      list,
      total,
    })
  }
  /**
   * 通过大类编码category_code查询值域名列表
   * @param categoryCode
   * @returns
   */
  async findCodeByCategoryCode(cates: Array<string> | string) {
    let list = [];
    try {
      if (Array.isArray(cates)) {
        const metedata = this.MetadataRepo.createQueryBuilder('Metadata');
        metedata.where('Metadata.categoryCode IN (:...cates)', { cates });
        metedata.select(['Metadata.code', 'Metadata.codeName', 'Metadata.categoryCode'])
        list = await metedata.getMany()
      } else if (typeof cates === 'string') {
        list = await this.MetadataRepo.find({
          where: {
            categoryCode: cates,
          },
          select: ['code', 'codeName', 'categoryCode'],
        });
      }
    } catch (err) {
      throw new Error(err)
    }
    const codeList = []
    const seen = new Map<string, boolean>();
    if (list.length > 0) {
      list.forEach(item => {
        const key = `${item.codeName}-${item.code}-${item.categoryCode}`;
        if (!seen.has(key)) {
          seen.set(key, true);
          codeList.push(item);
        }
      });
    }
    return codeList
  }
  /**
   * 通过值域code查询数据源值value列表，以选项列表的形式返回
   * @param query
   * @returns
   */
  async findValueListByCode(codes: string | Array<string>) {
    let valueList = []
    try {
      if (typeof codes === 'string') {
        valueList = await this.MetadataRepo.find({
          where: {
            code: codes,
            // delFlag: '0',
          },
          select: ['value', 'valueMean'],
        });
      } else if (Array.isArray(codes)) {
        valueList = await this.MetadataRepo.find({
          where: {
            code: In(codes),
            // delFlag: '0',
          },
          select: ['value', 'valueMean'],
        });
      }
      let list = valueList.map(item => (
        {
          value: item.value,
          label: item.valueMean
        }
      ))
      return ResultData.ok(list)
    } catch (err) {
      return ResultData.fail(500, 'server error', [])
    }
  }

  /**
   * 复杂查询
   * @param query 
   * @param Metadata 
   * @returns 
   */
  async findByCategory(query: ListMetadataDto, Metadata: any) {
    // 使用TypeORM的查询构建器（createQueryBuilder）来构建和执行复杂的数据库查询。
    const entity = this.MetadataRepo.createQueryBuilder('Metadata');
    entity.where('Metadata.delFlag = :delFlag', { delFlag: '0' });
    if (query.status) {
      entity.andWhere('Metadata.status = :status', { status: query.status });
    }
    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('Metadata.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }
    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }
    const [list, total] = await entity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 根据category（表单类型）获取表单feildLabel
   * @param category 元数据大类
   * @returns 
   */
  async getFieldList(query: SelectFieldListDto) {
    console.log('getFieldList-----165---');
    console.log(query);
    let { category, categoryCode } = query
    try {
      const entity = this.MetadataRepo.createQueryBuilder('Metadata');
      if (category) {
        entity.where('Metadata.category = :category', { category: category });
      } else if (categoryCode) {
        entity.where('Metadata.categoryCode = :categoryCode', { categoryCode: categoryCode });
      }
      const [list, total] = await entity.getManyAndCount();
      const fieldList = []
      list.map(item => {
        // if(feildList.findIndex(feild=>feild.fieldLabel==item.codeName) == -1)
        const isDuplicate = fieldList.some(field => field.fieldLabel === item.codeName);
        if (!isDuplicate) {
          const filed = {
            fieldName: item.code,
            fieldLabel: item.codeName,
          }
          fieldList.push(filed)
        }
      })
      // 后端需要返回[{},{}]这个格式
      return fieldList;
      // return ResultData.ok({
      //   fieldList,
      //   total,
      // });
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, err)
    }

  }


  async findValueListByCodeWithPagination(codes: string[] | string, offset: number, limit: number) {
    console.log('根据codes查询ICD10------------');
    console.log(codes);
    const queryBuilder = this.MetadataRepo.createQueryBuilder('metadata');
    if (typeof codes === 'string') {
      // 根据传入的 code 列表进行筛选
      queryBuilder.where('metadata.code = :codes', { codes });
    }
    else if (Array.isArray(codes)) {
      // 检查 codes 数组是否为空
      if (codes.length === 0) {
        return ResultData.ok([]);
      }
      // 根据传入的 code 列表进行筛选
      queryBuilder.where('metadata.code IN (:...codes)', { codes });
    }
    // 进行分页
    queryBuilder.skip(offset).take(limit);
    // 选择需要的字段
    queryBuilder.select(['metadata.code', 'metadata.value', 'metadata.valueMean']);
    try {
      const data = await queryBuilder.getMany();
      return ResultData.ok(data);
    } catch (error) {
      console.error('Error in findValueListByCodeWithPagination:', error);
      return ResultData.fail(500, 'Failed to fetch value list');
    }
  }
  /**
   * 停用元数据
   * @param changeStatusDto 
   */
  async changeStatus(changeStatusDto: any) {

  }
  /**
   * 批量删除元数据（删不了，应该是修改某一个状态值为不可查询或者其他）
   * @param ids
   * @returns
   */
  async remove(ids: number[]) {
    // 忽略系统角色的删除
    // const data = await this.MetadataRepo.update(
    //   { MetadataId: In(ids), MetadataType: Not(SYS_Metadata_TYPE.SYS) },
    //   {
    //     delFlag: '1',
    //   },
    // );
    // return ResultData.ok(data);
  }

  async findAll() {

  }
  /**
   * 导出元数据信息数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListMetadataDto, Metadata) {
    //   delete body.pageNum;
    //   delete body.pageSize;
    //   const list = await this.findAll(body, Metadata);
    //   const options = {
    //     sheetName: '用户数据',
    //     data: list.data.list,
    //     header: [
    //       { title: '用户序号', dataIndex: 'MetadataId' },
    //       { title: '登录名称', dataIndex: 'MetadataName' },
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
