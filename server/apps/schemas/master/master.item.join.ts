import { raw } from '@nestjs/mongoose'
import { MasterItemBrandJoin } from '@schemas/master/master.item.brand.join'
import { Types } from 'mongoose'

export const MasterItemJoin = raw({
  id: { type: String, example: `item-${new Types.ObjectId().toString()}` },
  code: { type: String, example: 'ABC00123' },
  name: { type: String, example: 'Any Item' },
  brand: { type: MasterItemBrandJoin, _id: false },
})
