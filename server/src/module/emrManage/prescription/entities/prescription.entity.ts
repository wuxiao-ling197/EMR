
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base';
@Entity('hospital_patient_prescription_line', {
    comment: '处方记录表',
})
/**
 * 数据处理逻辑 1.定义实体和列属性
 */

export class PrescriptionEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'id' })
    public id: number;

    @Column({ type: 'int', name: 'create_uid', comment: 'Created by' })
    public createUid: number;

    @Column({ type: 'int', name: 'write_uid', comment: 'Last Updated by' })
    public writeUid: number;

    @Column({ type: 'int', name: 'patient_record_id', comment: '处方' })
    public patientRecordId: number;

    @Column({ type: 'int', name: 'medicine_id', comment: '药品' })
    public medicineId: number;

    @Column({ type: 'int', name: 'quantity', comment: '数量' })
    public quantity: number;

    @Column({ type: 'varchar', name: 'take_frequency', nullable: false, comment: '使用时间' })
    public takeFrequency: string;

    @Column({ type: 'date', name: 'validity_expire_date', comment: '过期日期' })
    public validityExpireDate: Date;

    @Column({ type: 'text', name: 'note', comment: '备注' })
    public note: string;

    @Column({ type: 'float8', name: 'num_intakes', nullable: false, comment: '单次使用量' })
    public numIntakes: number;

    @Column({ type: 'float8', name: 'price', comment: '单价' })
    public price: number;

    @Column({ type: 'float8', name: 'total_price', comment: '总价' })
    public totalPrice: number;

    @Column({ type: 'timestamp', name: 'create_date', comment: 'Created on' })
    public createDate: Date;

    @Column({ type: 'timestamp', name: 'write_date', comment: 'Last Updated on' })
    public writeDate: Date;

}
