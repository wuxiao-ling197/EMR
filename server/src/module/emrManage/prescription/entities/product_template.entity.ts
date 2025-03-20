
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base';
@Entity('product_template', {
    comment: '药品表',
})
/**
 * 数据处理逻辑 1.定义实体和列属性
 */

export class ProductTemplateEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'id' })
    public id: number;

    @Column({ type: 'int', name: 'create_uid', comment: 'Created by' })
    public createUid: number;

    @Column({ type: 'int', name: 'write_uid', comment: 'Last Updated by' })
    public writeUid: number;

    @Column({ type: 'int', name: 'categ_id', nullable: false, comment: 'product template' })
    public categ_id: number;

    @Column({ type: 'int', name: 'uom_id', nullable: false, comment: 'product template' })
    public uom_id: number;

    @Column({ type: 'int', name: 'uom_po_id', nullable: false, comment: 'product template' })
    public uom_po_id: number;

    @Column({ type: 'varchar', name: 'type', nullable: false, comment: 'product template' })
    public type: string;

    @Column({ type: 'jsonb', name: 'name', nullable: false, comment: 'product template' })
    public name: Record<string, any>;

    @Column({ type: 'varchar', name: 'tracking', nullable: false, comment: 'product template' })
    public tracking: string;

    @Column({ type: 'varchar', name: 'sale_line_warn', nullable: false, comment: 'product template' })
    public sale_line_warn: string;

    @Column({ type: 'varchar', name: 'version_number', nullable: false, comment: '版本号' })
    public version_number: string;

    @Column({ type: 'timestamp', name: 'create_date', comment: 'Created on' })
    public createDate: Date;

    @Column({ type: 'varchar', name: 'write_date', comment: 'Last Updated on' })
    public writeDate: Date;

    // 还有非常多的属性（非必填）暂时不写了

}
