import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm'
import { MasterItemModel } from './master.item.model'
import { MasterItemBatchModel } from './master.item.batch.model'
import { ColumnNumericTransformer } from '@/utilities/class.transformer.postgres'
import { properties } from '@/utilities/models/column'
import { ApiProperty } from '@nestjs/swagger'
import { ValidateNested } from 'class-validator'
import { AccountModel } from './account.model'

@Entity({ name: 'stock_log' })
export class StockLogModel {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => MasterItemModel, (brand) => brand.id)
  item: MasterItemModel

  @ManyToOne(() => MasterItemBatchModel, (brand) => brand.id)
  batch: MasterItemBatchModel

  @Column({
    type: 'enum',
    enum: ['in', 'out'],
    default: 'in',
    comment: 'in or out',
  })
  type: string

  @Column('numeric', {
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  qty: number

  @Column('numeric', {
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  balance: number

  @ApiProperty({
    example: '',
    type: AccountModel,
    description: 'Account who create purchase order',
  })
  @ValidateNested()
  @ManyToOne(() => AccountModel, (foreign) => foreign.id)
  created_by: AccountModel

  @Column(properties.remark)
  remark: string

  @CreateDateColumn(properties.created_at)
  created_at: Date

  @UpdateDateColumn(properties.updated_at)
  updated_at: Date

  @DeleteDateColumn(properties.deleted_at)
  deleted_at: Date
}
