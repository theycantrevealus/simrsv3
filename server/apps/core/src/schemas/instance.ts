import { IAccountCreatedBy } from '@core/account/interface/account.create_by'
import { AccountJoin } from '@core/account/schemas/account.join'
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'
import { TimeManagement } from '@utility/time'
import { HydratedDocument, SchemaTypes } from 'mongoose'

import { ConfigJoin, IConfig } from './config'

export type InstanceDocument = HydratedDocument<Instance>
@Schema({ collection: 'core_instance' })
export class Instance {
  @Prop({ type: SchemaTypes.String, unique: true })
  id: string

  @Prop({ type: SchemaTypes.String, unique: true })
  code: string

  @Prop({ type: SchemaTypes.String, unique: true })
  name: string

  @Prop({ type: SchemaTypes.String })
  phone: string

  @Prop({ type: SchemaTypes.String })
  email: string

  @Prop({ type: SchemaTypes.String })
  domain: any

  @Prop({ type: SchemaTypes.String })
  address: any

  @Prop({ type: SchemaTypes.String })
  remark: string

  @Prop({
    type: [ConfigJoin],
    default: [],
    required: false,
    _id: false,
  })
  config: IConfig[]

  @Prop(raw(AccountJoin))
  created_by: IAccountCreatedBy

  @Prop({
    type: SchemaTypes.Date,
    default: () => new TimeManagement().getTimezone('Asia/Jakarta'),
  })
  created_at: Date

  @Prop({
    type: SchemaTypes.Date,
    default: () => new TimeManagement().getTimezone('Asia/Jakarta'),
  })
  updated_at: Date

  @Prop({ type: SchemaTypes.Mixed, default: null })
  deleted_at: Date | null
}
export const InstanceSchema = SchemaFactory.createForClass(Instance)

export interface IInstance {
  id: string
  code: string
  name: string
}

export const InstanceJoin = raw({
  id: { type: String },
  code: { type: String },
  name: { type: String },
})
