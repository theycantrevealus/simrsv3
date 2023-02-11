import { AccountModel } from '@core/account/schemas/account.model'
import {
  MasterItemSupplierAddDTO,
  MasterItemSupplierEditDTO,
} from '@core/master/dto/master.item.supplier'
import {
  MasterItemSupplierDocument,
  MasterItemSupplierModel,
} from '@core/master/schemas/master.item.supplier'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GlobalResponse } from '@utility/dto/response'
import { modCodes } from '@utility/modules'
import { prime_datatable } from '@utility/prime'
import { TimeManagement } from '@utility/time'
import { Model, Types } from 'mongoose'

@Injectable()
export class MasterItemSupplierService {
  constructor(
    @InjectModel(MasterItemSupplierModel.name)
    private masterItemSupplierModel: Model<MasterItemSupplierDocument>
  ) {}

  async all(parameter: any) {
    return await prime_datatable(parameter, this.masterItemSupplierModel)
  }

  async add(
    parameter: MasterItemSupplierAddDTO,
    account: AccountModel
  ): Promise<GlobalResponse> {
    const response = {
      statusCode: '',
      message: '',
      payload: {},
      transaction_classify: 'MASTER_ITEM_SUPPLIER_ADD',
      transaction_id: null,
    } satisfies GlobalResponse

    const newData = new this.masterItemSupplierModel({
      ...parameter,
      created_by: account,
    })

    await newData
      .save()
      .then((result) => {
        response.message = 'Master item supplier created successfully'
        response.statusCode = `${modCodes[this.constructor.name]}_I_${
          modCodes.Global.success
        }`
        response.transaction_id = result._id
        response.payload = result
      })
      .catch((error: Error) => {
        response.message = `Master item supplier failed to create. ${error.message}`
        response.statusCode = `${modCodes[this.constructor.name]}_I_${
          modCodes.Global.failed
        }`
        response.payload = error
      })

    return response
  }

  async edit(
    parameter: MasterItemSupplierEditDTO,
    _id: string
  ): Promise<GlobalResponse> {
    const response = {
      statusCode: '',
      message: '',
      payload: {},
      transaction_classify: 'MASTER_ITEM_SUPPLIER_EDIT',
      transaction_id: null,
    } satisfies GlobalResponse
    const data = await this.masterItemSupplierModel.findOne({
      _id: new Types.ObjectId(_id),
      __v: parameter.__v,
    })

    if (data) {
      data.code = parameter.code
      data.name = parameter.name
      data.phone = parameter.phone
      data.email = parameter.email
      data.address = parameter.address
      data.remark = parameter.remark
      data.seller_name = parameter.seller_name

      await data
        .save()
        .then((result) => {
          response.message = 'Master item supplier updated successfully'
          response.statusCode = `${modCodes[this.constructor.name]}_I_${
            modCodes.Global.success
          }`
          response.payload = result
        })
        .catch((error: Error) => {
          response.message = `Master item supplier failed to update. ${error.message}`
          response.statusCode = `${modCodes[this.constructor.name]}_I_${
            modCodes.Global.failed
          }`
          response.payload = error
        })
    } else {
      response.message = `Master item supplier failed to update. Invalid document`
      response.statusCode = `${modCodes[this.constructor.name]}_I_${
        modCodes.Global.failed
      }`
      response.payload = {}
    }
    return response
  }

  async delete(_id: string): Promise<GlobalResponse> {
    const response = {
      statusCode: '',
      message: '',
      payload: {},
      transaction_classify: 'MASTER_ITEM_SUPPLIER_DELETE',
      transaction_id: null,
    } satisfies GlobalResponse
    const data = await this.masterItemSupplierModel.findOne({
      _id: new Types.ObjectId(_id),
    })

    if (data) {
      data.deleted_at = new TimeManagement().getTimezone('Asia/Jakarta')

      await data
        .save()
        .then((result) => {
          response.message = 'Master item supplier deleted successfully'
          response.statusCode = `${modCodes[this.constructor.name]}_I_${
            modCodes.Global.success
          }`
        })
        .catch((error: Error) => {
          response.message = `Master item supplier failed to delete. ${error.message}`
          response.statusCode = `${modCodes[this.constructor.name]}_I_${
            modCodes.Global.failed
          }`
          response.payload = error
        })
    } else {
      response.message = `Master item supplier failed to deleted. Invalid document`
      response.statusCode = `${modCodes[this.constructor.name]}_I_${
        modCodes.Global.failed
      }`
      response.payload = {}
    }
    return response
  }
}
