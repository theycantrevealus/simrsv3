import { IAccount } from '@gateway_core/account/interface/account.create_by'
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AccountJoin } from '@schemas/account/account.raw'
import { ILOV } from '@schemas/lov/lov.interface'
import { LOVJoin } from '@schemas/lov/lov.join'
import { IQueue } from '@schemas/management/queue.interface'
import { QueueJoin } from '@schemas/management/queue.join'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type MasterReceptionistCounterDocument =
  HydratedDocument<MasterReceptionistCounter>

@Schema({ collection: 'master_receptionist_counter' })
export class MasterReceptionistCounter {
  @Prop({ type: SchemaTypes.String, unique: true })
  id: string

  @Prop({ type: SchemaTypes.String, required: true, unique: true })
  code: string

  @Prop({
    unique: false,
    required: false,
    type: [LOVJoin],
    _id: false,
  })
  queue_type: ILOV[]

  @Prop({
    type: AccountJoin,
    _id: false,
    required: false,
    default: null,
  })
  assigned_receptionist: IAccount

  @Prop({
    unique: false,
    required: false,
    type: QueueJoin,
    _id: false,
    // default: null,
  })
  current_queue: IQueue

  @Prop({ type: SchemaTypes.String })
  remark: string

  @Prop(AccountJoin)
  created_by: IAccount

  @Prop({
    type: SchemaTypes.Date,
    default: new Date(),
    required: true,
  })
  created_at: Date

  @Prop({
    type: SchemaTypes.Date,
    default: new Date(),
    required: true,
  })
  updated_at: Date

  @Prop({ type: SchemaTypes.Mixed, default: null })
  deleted_at: Date | null
}

export const MasterReceptionistCounterSchema = SchemaFactory.createForClass(
  MasterReceptionistCounter
)

export interface IMasterReceptionistCounter {
  id: string
  code: string
}

export const MasterReceptionistCounterJoin = raw({
  id: { type: String, example: `item-${new Types.ObjectId().toString()}` },
  code: { type: String, example: 'MSTRC00001' },
})
