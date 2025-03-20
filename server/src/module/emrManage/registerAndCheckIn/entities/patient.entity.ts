
import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base';
import { HospitalPatientRecordEntity } from './hospital_patient_record.entity';
import { PatientQueueEntity } from '../../patient/entities/patient-queue.entity';
@Entity('hospital_patient', {
  comment: '病人信息表',
})
/**
 * 数据处理逻辑 1.定义实体和列属性
 */

// export class MetadataEntity extends BaseEntity {
export class PatientEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'id' })
  public id: number;

  @Column({ type: 'int', name: 'gender', nullable: false, comment: '性别代码' })
  public gender: number;

  @Column({ type: 'int', name: 'nation', comment: '民族' })
  public nation?: number;

  @Column({ type: 'int', name: 'card_type_code', comment: '卡类别代码' })
  public card_type_code?: number;

  @Column({ type: 'int', name: 'disa_res', comment: '残疾情况' })
  public disaRes?: number;

  @Column({ type: 'int', name: 'die_location', comment: '死亡地点' })
  public dieLocation?: number;

  @Column({ type: 'int', name: 'schoolgrade', comment: '文化水平' })
  public schoolgrade?: number;

  @Column({ type: 'int', name: 'address_type_code', comment: '地址类别代码' })
  public addressTypeCode?: number;

  @Column({ type: 'int', name: 'country_id', default: 48, comment: '国家' })
  public countryId?: number;

  @Column({ type: 'int', name: 'state_id', comment: '省(自治区、直辖市)' })
  public stateId?: number;

  @Column({ type: 'int', name: 'city_id', comment: '市(地区、州)' })
  public cityId?: number;

  @Column({ type: 'int', name: 'area_id', comment: '县(区)' })
  public areaId?: number;

  @Column({ type: 'int', name: 'domicile_state_id', comment: '户籍地址-省(自治区、直辖市)' })
  public domicileStateId?: number;

  @Column({ type: 'int', name: 'domicile_city_id', comment: '户籍地址-市(地区、州)' })
  public domicileCityId?: number;

  @Column({ type: 'int', name: 'domicile_area_id', comment: '户籍地址-县(区)' })
  public domicileAreaId?: number;

  @Column({ type: 'int', name: 'insurance', comment: '医疗保险类别代码' })
  public insurance?: number;

  @Column({ type: 'int', name: 'marry', comment: '婚姻状况代码' })
  public marry?: number;

  @Column({ type: 'int', name: 'career', comment: '职业类别代码' })
  public career?: number;

  @Column({ type: 'int', name: 'work_subjection', comment: '单位隶属关系' })
  public workSubjection?: number;

  @Column({ type: 'int', name: 'average_income', comment: '家庭年人均收入' })
  public averageIncome?: number;

  @Column({ type: 'int', name: 'create_uid', comment: 'Created by' })
  public createUid?: number;

  @Column({ type: 'int', name: 'write_uid', comment: 'Last Updated by' })
  public writeUid?: number;

  @Column({ type: 'varchar', name: 'name', nullable: false, comment: '姓名' })
  public name: string;

  @Column({ type: 'varchar', name: 'old_name', comment: '曾用名' })
  public oldName?: string;

  @Column({ type: 'varchar', name: 'politicalface', comment: '政治面貌' })
  public politicalface?: string;

  @Column({ type: 'varchar', name: 'citizen_health_card_code', comment: '居民健康卡号' })
  public citizenHealthCardCode?: string;

  @Column({ type: 'varchar', name: 'citizen_health_archive_code', comment: '居民健康档案编号' })
  public citizenHealthArchiveCode?: string;

  @Column({ type: 'int', name: 'id_type', default: 1, comment: '证件类型' })
  public idType?: number;

  @Column({ type: 'varchar', name: 'identifyid', nullable: false, comment: '身份证号码' })
  public identifyid?: string;

  @Column({ type: 'varchar', name: 'phonenumber', comment: '预留电话号码' })
  public phonenumber?: string;

  @Column({ type: 'varchar', name: 'disa_lv', comment: '残疾等级' })
  public disaLv?: string;

  @Column({ type: 'varchar', name: 'die_reason', comment: '死亡原因' })
  public dieReason?: string;

  @Column({ type: 'varchar', name: 'unique', comment: '唯一识别码' })
  public unique?: string;

  @Column({ type: 'varchar', name: 'fax', comment: '传真' })
  public fax?: string;

  @Column({ type: 'varchar', name: 'mail', comment: '邮箱' })
  public mail?: string;

  @Column({ type: 'varchar', name: 'address_detail', comment: '详细地址' })
  public addressDetail?: string;

  @Column({ type: 'varchar', name: 'domicile_address_detail', comment: '户籍详细地址' })
  public domicileAddressDetail?: string;

  @Column({ type: 'varchar', name: 'work_name', comment: '工作单位名称' })
  public workName?: string;

  @Column({ type: 'varchar', name: 'work_phone', comment: '工作单位电话号码' })
  public workPhone?: string;

  @Column({ type: 'varchar', name: 'mail_code', comment: '邮政编码' })
  public mail_code?: string;

  @Column({ type: 'varchar', name: 'contact_name', comment: '联系人姓名' })
  public contactName?: string;

  @Column({ type: 'varchar', name: 'contact_phone', comment: '联系人电话号码' })
  public contactPhone?: string;

  @Column({ type: 'varchar', name: 'contact_categ', comment: '联系人关系' })
  public contacCateg?: string;

  @Column({ type: 'text', name: 'remark', comment: '备注' })
  public remark?: string;

  @Column({ type: 'bool', name: 'army', comment: '退役军人' })
  public army?: boolean;

  @Column({ type: 'bool', name: 'disability', comment: '残疾人' })
  public disability?: boolean;

  @Column({ type: 'bool', name: 'die', comment: '死亡' })
  public die?: boolean;

  // @Column({ type: 'bool', name: 'inpatient_flag', nullable: false, comment: '患者是否就诊' })
  // public inpatient_flag: boolean;

  @Column({ type: 'timestamp', name: 'date_of_birth', comment: '出生日期' })
  public dateOfBirth?: Date;

  @Column({ type: 'timestamp', name: 'create_date', comment: 'Created on' })
  public createDate?: Date;

  @Column({ type: 'varchar', name: 'write_date', comment: 'Last Updated on' })
  public writeDate?: Date;

  // emlpoyee 外键res_user.user_id,最终查询结构为resuser.employee
  @OneToOne(() => HospitalPatientRecordEntity, (record) => record.patient)
  // @JoinColumn({ name: 'id', referencedColumnName: 'patientID' }) // 指定外键列,是实体中的定义名称
  public record?: HospitalPatientRecordEntity;

  @OneToMany(() => PatientQueueEntity, (queue) => queue.patient)
  // @JoinColumn({ name: 'id', referencedColumnName: 'patientID' })
  public queue?: PatientQueueEntity;
}
