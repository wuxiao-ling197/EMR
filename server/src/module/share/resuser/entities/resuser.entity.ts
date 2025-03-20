import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SharedEntity } from 'src/common/entities/shared';
import { HrEmpEntity } from './hremp.entity';
import { ResoureceEntity } from './resource.entity';
@Entity('res_users', {
  comment: 'User',
})
export class ResUserEntity extends SharedEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  public id: number;

  @Column({ type: 'int', name: 'company_id', nullable: false, default: 1 })
  public companyId: number;

  @Column({ type: 'int', name: 'partner_id', nullable: false, default: null })
  public partnerId: number;

  @Column({ type: 'varchar', name: 'login', nullable: false, comment: '登录账号' })
  public login: string;

  @Exclude({ toPlainOnly: true }) // 输出屏蔽密码
  @Column({ type: 'varchar', default: '', comment: '用户登录密码' })
  public password: string;

  @Column({ type: 'varchar', name: 'totp_secret' })
  public totpSecret: string;

  @Column({ type: 'varchar', name: 'nest_secret' })
  public nestSecret: string;

  @Column({ type: 'int', name: 'action_id', default: null, comment: '自定义菜单' })
  public actionId: number;

  @Column({ type: 'text', name: 'signature', comment: 'Email Signature' })
  public signature: string;

  @Column({ type: 'boolean', name: 'share', default: false, comment: 'Share User' })
  public share: boolean;

  @Column({ type: 'varchar', name: 'notification_type', default: 'email' })
  public notificationType: string;

  @Column({ type: 'int', name: 'karma', default: 0, comment: 'karma' })
  public karma: number;

  @Column({ type: 'int', name: 'rank_id', default: null, comment: 'Rank' })
  public rankId: number;

  @Column({ type: 'int', name: 'next_rank_id', default: 1, comment: 'Next Rank' })
  public nextRankId: number;

  @Column({ type: 'varchar', name: 'odoobot_state', comment: 'Odoobot  Status' })
  public odoobotState: string;

  @Column({ type: 'boolean', name: 'odoobot_failed', default: null, comment: 'Odoobot Failed' })
  public odoobotFailed: boolean;

  @Column({ type: 'int', name: 'sale_team_id', default: null, comment: 'User Sales Team' })
  public saleTeamId: number;

  // @Column({ type: 'int', name: 'website_id', default: null, comment: 'Website' })
  // public websiteId: number;

  // emlpoyee 外键res_user.user_id,最终查询结构为resuser.employee
  @OneToOne(() => HrEmpEntity, (employee) => employee.user)
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' }) // 指定外键列,是实体中的定义名称
  public employee: HrEmpEntity;

  @OneToOne(() => ResoureceEntity, (resource) => resource.user)
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  public resource: ResoureceEntity;

  //auth_totp-->user为多--->一
  // @OneToMany(() => AuthTotpEntity, (authtotp) => authtotp.user)
  // public authtotps: AuthTotpEntity[];
}
