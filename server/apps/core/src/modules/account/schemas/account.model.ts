import { IAccountCreatedBy } from '@core/account/interface/account.create_by'
import { AccountJoin } from '@core/account/schemas/account.join'
import {
  AuthorityJoin,
  IAuthority,
} from '@core/account/schemas/authority.model'
import { IMenu } from '@core/menu/interfaces/menu.interface'
import { IMenuPermission } from '@core/menu/interfaces/menu.permission.interface'
import { MenuJoin, MenuPermissionJoin } from '@core/menu/schemas/menu.model'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, SchemaTypes } from 'mongoose'

export type AccountDocument = HydratedDocument<Account>
@Schema({ collection: 'core_account' })
export class Account {
  @Prop({ type: SchemaTypes.String, unique: true })
  id: string

  @Prop({
    type: SchemaTypes.String,
    lowercase: true,
    unique: true,
  })
  code: string

  @Prop({
    type: SchemaTypes.String,
    min: 8,
    max: 24,
    unique: true,
  })
  email: string

  @Prop(AuthorityJoin)
  authority: IAuthority

  @Prop({ type: SchemaTypes.String, min: 8, max: 24 })
  password: string

  @Prop({ type: SchemaTypes.String, unique: false })
  first_name: string

  @Prop({ type: SchemaTypes.String, unique: false })
  last_name: string

  @Prop({
    type: SchemaTypes.String,
    unique: true,
  })
  phone: string

  @Prop({
    unique: false,
    type: [MenuJoin],
    default: [],
    _id: false,
  })
  access: IMenu[]

  @Prop({
    unique: false,
    type: [MenuPermissionJoin],
    default: [],
    required: false,
    _id: false,
  })
  permission: IMenuPermission[]

  @Prop(AccountJoin)
  created_by: IAccountCreatedBy

  @Prop({
    type: SchemaTypes.Date,
    default: new Date(),
  })
  created_at: Date

  @Prop({
    type: SchemaTypes.Date,
    default: new Date(),
  })
  updated_at: Date

  @Prop({ type: SchemaTypes.Mixed, default: null })
  deleted_at: Date | null
}

export const AccountSchema = SchemaFactory.createForClass(Account)
