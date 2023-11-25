import { IAccountCreatedBy } from '@core/account/interface/account.create_by'
import { AccountJoin } from '@core/account/schemas/account.join'
import { IMasterStockPoint } from '@core/master/interface/master.stock.point'
import { MasterStockPointJoin } from '@core/master/schemas/master.stock.point.join'
import { IGeneralReceiveNoteDetail } from '@inventory/interface/general.receive.note.detail'
import { IPurchaseOrder } from '@inventory/interface/purchase.order'
import { GeneralReceiveNoteDetail } from '@inventory/schemas/general.receive.note.detail'
import { PurchaseOrderJoin } from '@inventory/schemas/purchase.order.join'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, SchemaTypes } from 'mongoose'

export type GeneralReceiveNoteDocument = HydratedDocument<GeneralReceiveNote>

@Schema({ collection: 'inventory_general_receive_note' })
export class GeneralReceiveNote {
  @Prop({ type: SchemaTypes.String, unique: true })
  id: string

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  code: string

  @Prop({ type: SchemaTypes.Mixed, required: false })
  extras: any

  @Prop(MasterStockPointJoin)
  stock_point: IMasterStockPoint

  @Prop(PurchaseOrderJoin)
  purchase_order: IPurchaseOrder

  @Prop({
    type: [GeneralReceiveNoteDetail],
    _id: false,
  })
  detail: IGeneralReceiveNoteDetail

  @Prop({ type: SchemaTypes.String })
  remark: string

  @Prop(AccountJoin)
  created_by: IAccountCreatedBy

  @Prop({
    type: SchemaTypes.String,
    default: () => 'Asia/Jakarta',
    required: true,
  })
  timezone: string

  @Prop({
    type: SchemaTypes.Date,
    default: () => new Date(),
    required: true,
  })
  created_at: Date

  @Prop({
    type: SchemaTypes.Date,
    default: () => new Date(),
    required: true,
  })
  updated_at: Date

  @Prop({ type: SchemaTypes.Mixed, default: null })
  deleted_at: Date | null
}

export const GeneralReceiveNoteSchema =
  SchemaFactory.createForClass(GeneralReceiveNote)
