import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository, SelectQueryBuilder } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { CreateHrDeptDto, UpdateHrDeptDto, ListHrDeptDto } from './dto/index';
import { ListToTree } from 'src/common/utils/index';
import { DataScopeEnum } from 'src/common/enum/index';
import { HrDeptEntity } from './entities/hrdept.entity';
import { ResCompEntity } from '../resuser/entities/rescompany.entity';

@Injectable()
export class HrDeptService {
  constructor(
    @InjectRepository(HrDeptEntity, 'odoo18')
    private readonly hrDeptEntityRep: Repository<HrDeptEntity>,
    @InjectRepository(ResCompEntity, 'odoo18')
    private readonly companyEntityRep: Repository<ResCompEntity>,
  ) { }

  async create(createHrDeptDto: CreateHrDeptDto) {
    if (createHrDeptDto.parentId) {
      const parent = await this.hrDeptEntityRep.findOne({
        where: {
          id: createHrDeptDto.parentId,
          available: true,
        },
        select: ['parentId'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const parentId = parent.parentId ? `${parent.parentId},${createHrDeptDto.parentId}` : `${createHrDeptDto.parentId}`;
      Object.assign(createHrDeptDto, { parentId: parentId });
    }
    await this.hrDeptEntityRep.save(createHrDeptDto);
    return ResultData.ok();
  }

  async findAll(query: ListHrDeptDto) {
    const entity = this.hrDeptEntityRep.createQueryBuilder('entity');
    // 数据库里available全是f和null……
    entity.where('entity.available = :available', { available: true });

    if (query.name) {
      entity.andWhere('entity.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.available) {
      entity.andWhere('entity.available = :available', { available: query.available });
    }
    const res = await entity.getMany();
    console.log('deptlist');
    console.log(res);


    return ResultData.ok(res);
  }

  async findOne(id: number) {
    const data = await this.hrDeptEntityRep.findOne({
      where: {
        id: id,
        available: true,
      },
    });
    return ResultData.ok(data);
  }

  /**
   * 根据数据权限范围和部门ID查询部门ID列表。
   * @param deptId 部门ID，表示需要查询的部门。
   * @param dataScope 数据权限范围，决定查询的部门范围。
   * @returns 返回一个部门ID数组，根据数据权限范围决定返回的部门ID集合。
   */
  async findDeptIdsByDataScope(id: number, dataScope: DataScopeEnum) {
    try {
      // 创建部门实体的查询构建器
      const entity = this.hrDeptEntityRep.createQueryBuilder('dept');
      // 筛选出删除标志为未删除的部门
      entity.where('dept.id = :id', { id: id });

      // 根据不同的数据权限范围添加不同的查询条件
      if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT) {
        // 如果是本部门数据权限，则只查询指定部门
        this.addQueryForDeptDataScope(entity, id);
      } else if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
        // 如果是本部门及子部门数据权限，则查询指定部门及其所有子部门
        this.addQueryForDeptAndChildDataScope(entity, id);
      } else if (dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
        // 如果是仅本人数据权限，则不查询任何部门，直接返回空数组
        return [];
      }
      // 执行查询并获取结果
      const list = await entity.getMany();
      // console.log('部门权限=', list);

      // 将查询结果映射为部门ID数组后返回
      return list.map((item) => item.id);
    } catch (error) {
      console.error('Failed to query department IDs:', error);
      throw new Error('Querying department IDs failed');
    }
  }

  /**
   * 添加查询条件以适应本部门数据权限范围。
   * @param queryBuilder 查询构建器实例
   * @param deptId 部门ID
   */
  private addQueryForDeptDataScope(queryBuilder: SelectQueryBuilder<any>, id: number) {
    queryBuilder.andWhere('dept.id = :id', { id: id });
  }

  /**
   * 添加查询条件以适应本部门及子部门数据权限范围。
   * @param queryBuilder 查询构建器实例
   * @param deptId 部门ID
   */
  private addQueryForDeptAndChildDataScope(queryBuilder: SelectQueryBuilder<any>, id: number) {
    // 使用参数化查询以防止SQL注入
    queryBuilder
      .andWhere('dept.parentId LIKE :parentId', {
        parentId: `%${id}%`,
      })
      .orWhere('dept.id = :id', { id: id });
  }

  async findListExclude(id: number) {
    //TODO 需排出ancestors 中不出现id的数据
    const data = await this.hrDeptEntityRep.find({
      where: {
        available: true,
      },
    });
    return ResultData.ok(data);
  }

  async update(updateHrDeptDto: UpdateHrDeptDto) {
    if (updateHrDeptDto.parentId && updateHrDeptDto.parentId !== 0) {
      const parent = await this.hrDeptEntityRep.findOne({
        where: {
          id: updateHrDeptDto.parentId,
          available: true,
        },
        select: ['parentId'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const parentId = parent.parentId ? `${parent.parentId},${updateHrDeptDto.parentId}` : `${updateHrDeptDto.parentId}`;
      Object.assign(updateHrDeptDto, { ancestors: parentId });
    }
    await this.hrDeptEntityRep.update({ id: updateHrDeptDto.id }, updateHrDeptDto);
    return ResultData.ok();
  }

  async remove(id: number) {
    const data = await this.hrDeptEntityRep.update(
      { id: id },
      {
        available: false,
      },
    );
    return ResultData.ok(data);
  }

  /**
   * 部门树 供userservice调用
   * @returns
   */
  async deptTree() {
    // .select(['comp.id', 'comp.name', 'comp.parentId', 'dept.id', 'dept.name.zh_CN', 'dept.parentId'])
    const comp = await this.companyEntityRep.createQueryBuilder('comp').leftJoinAndMapMany('comp.departments', HrDeptEntity, 'dept', 'comp.id = dept.companyId').getMany();
    const compIds = comp.map((c) => c.id);
    const res = await this.hrDeptEntityRep.find({
      where: {
        active: true,
        companyId: In(compIds),
      },
    });
    // console.log('dept res=', res);
    const tree = ListToTree(
      res,
      (m) => m.id,
      (m) => m.name.en_US, // (m) => m.name.zh_CN, 数据库内容变了
    );
    return tree;
  }
}
