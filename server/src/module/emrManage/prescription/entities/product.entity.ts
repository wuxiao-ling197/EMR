
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base';
import { ProductTemplateEntity } from './product_template.entity';
@Entity('product_product', {
    comment: '产品表',
})
/**
 * 数据处理逻辑 1.定义实体和列属性
 */

export class ProductEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'id' })
    public id: number;

    @Column({ type: 'int', name: 'create_uid', comment: 'Created by' })
    public createUid: number;

    @Column({ type: 'int', name: 'write_uid', comment: 'Last Updated by' })
    public writeUid: number;

    @Column({ type: 'int', name: 'product_tmpl_id', nullable: false, comment: 'product template' })
    public productTmplId: number;

    @Column({ type: 'varchar', name: 'default_code', comment: 'internal reference' })
    public defaultCode: string;

    @Column({ type: 'varchar', name: 'barcode', comment: 'Barcode' })
    public barcode: string;

    @Column({ type: 'varchar', name: 'combination_indices', comment: 'Combination Indices' })
    public combinationIndices: string;

    @Column({ type: 'jsonb', name: 'standard_price', comment: 'Cost' })
    public standardPrice: Record<string, any>;

    @Column({ type: 'numeric', name: 'volume', comment: 'Volume' })
    public volume: number;

    @Column({ type: 'numeric', name: 'weight', comment: 'weight' })
    public weight: number;

    @Column({ type: 'bool', name: 'active', comment: 'active' })
    public active: boolean;

    @Column({ type: 'bool', name: 'can_image_variant_1024_be_zoomed', comment: 'Can Variant Image 1024 be zoomed' })
    public can_image_variant_1024_be_zoomed: boolean;

    @Column({ type: 'jsonb', name: 'lot_properties_definition', comment: 'Lot Properties' })
    public lot_properties_definition: Record<string, any>;

    @Column({ type: 'timestamp', name: 'create_date', comment: 'Created on' })
    public createDate: Date;

    @Column({ type: 'varchar', name: 'write_date', comment: 'Last Updated on' })
    public writeDate: Date;

    @ManyToOne(() => ProductTemplateEntity, { nullable: true })
    @JoinColumn({ name: 'product_tmpl_id' }) // 确保列名与数据库中的列名一致
    productTmpl: ProductTemplateEntity;
}
