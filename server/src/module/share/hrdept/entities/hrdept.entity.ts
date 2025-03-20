import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SharedEntity } from 'src/common/entities/shared';
import { HrEmpEntity } from '../../resuser/entities/hremp.entity';

// @Entity({ database: 'odoo18' }) // 指定数据库的连接名称
@Entity('hr_department', {
  comment: 'Department',
})
export class HrDeptEntity extends SharedEntity {
  @ApiProperty({ type: String, description: '部门ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '部门ID' })
  public id: number;

  @ApiProperty({ type: String, description: 'Parent Department' })
  @Column({ type: 'int', name: 'parent_id', default: null, comment: 'Parent Department' })
  public parentId: number;

  @ApiProperty({ type: String, description: 'Company' })
  @Column({ type: 'int', name: 'company_id', default: null, comment: 'Company' })
  public companyId: number;

  //ApiProperty仅影响 Swagger 文档的生成
  @ApiProperty({ type: String, description: 'Parent Department' })
  @Column({ type: 'int', name: 'manager_id', default: null, comment: 'Manager' })
  public managerId: number;

  @Column({ type: 'int', name: 'color', default: null, comment: 'Color Index' })
  public color: number;

  @Column({ type: 'int', name: 'master_department_id', default: null, comment: 'Master Department' })
  public masterDepartmentId: number;

  @Column({ type: 'int', name: 'duty_id', default: null, comment: '负责人' })
  public dutyId: number;

  @Column({ type: 'varchar', name: 'parent_path', comment: 'Parent Path' })
  public parentPath: string;

  @Column({ type: 'varchar', name: 'complete_name', comment: 'Complete Name' })
  public completeName: string;

  @Column({ type: 'jsonb', name: 'name', comment: 'Department Name' })
  public name: Record<string, any>;

  @Column({ type: 'int', name: 'property', default: null, comment: '科室属性' })
  public property: number;

  @Column({ type: 'varchar', name: 'code', default: null, comment: '科室编码' })
  public code: string;

  @Column({ type: 'varchar', name: 'DeptCode', default: null, comment: '部门编码' })
  public DeptCode: string;

  @Column({ type: 'text', name: 'note', default: null, comment: 'Note' })
  public note: string;

  @Column({ type: 'boolean', name: 'virtual', default: null, comment: '非实体部门' })
  public virtual: boolean;

  @Column({ type: 'boolean', name: 'available', default: true, comment: '是否弃用' })
  public available: boolean;

  @OneToMany(() => HrEmpEntity, (employee) => employee.department)
  employees: HrEmpEntity[];
}
