import { Account } from '@core/account/schemas/account.model'
import { LOVAddDTO, LOVEditDTO } from '@core/lov/dto/lov'
import { LOV, LOVDocument } from '@core/lov/schemas/lov'
import { ILOV } from '@core/lov/schemas/lov.join'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GlobalResponse } from '@utility/dto/response'
import { modCodes } from '@utility/modules'
import { prime_datatable } from '@utility/prime'
import { TimeManagement } from '@utility/time'
import { Model } from 'mongoose'

@Injectable()
export class LOVService {
  constructor(@InjectModel(LOV.name) private lovModel: Model<LOVDocument>) {}

  async all(parameter: any) {
    return await prime_datatable(parameter, this.lovModel)
  }

  async detail(id: string): Promise<LOV> {
    return this.lovModel.findOne({ id: id }).exec()
  }

  async find(term: any): Promise<LOV> {
    return this.lovModel.findOne(term).exec()
  }

  async upsert(term: any, account: Account): Promise<ILOV> {
    let target: ILOV = await this.find({ name: term.name })
    if (!target) {
      await this.add(
        {
          name: term.name,
          parent: term.parent,
          remark: term.remark,
        },
        account
      ).then((result) => {
        target = {
          id: `lov-${result.transaction_id.toString()}`,
          name: term.name,
          value: term.value,
        }
      })
    }
    return target
  }

  async add(data: LOVAddDTO, account: Account): Promise<GlobalResponse> {
    const response = {
      statusCode: '',
      message: '',
      payload: {},
      transaction_classify: 'LOV_ADD',
      transaction_id: null,
    } satisfies GlobalResponse

    await this.lovModel
      .create({
        ...data,
        created_by: account,
      })
      .then((result) => {
        response.message = 'LOV created successfully'
        response.statusCode = `${modCodes[this.constructor.name]}_I_${
          modCodes.Global.success
        }`
        response.transaction_id = result._id
        response.payload = result
      })
      .catch((error: Error) => {
        response.message = `LOV failed to create. ${error.message}`
        response.statusCode = `${modCodes[this.constructor.name]}_I_${
          modCodes.Global.failed
        }`
        response.payload = error
      })

    return response
  }

  async edit(data: LOVEditDTO, id: string): Promise<GlobalResponse> {
    const response = {
      statusCode: '',
      message: '',
      payload: {},
      transaction_classify: 'LOV_EDIT',
      transaction_id: null,
    } satisfies GlobalResponse
    await this.lovModel
      .findOneAndUpdate(
        {
          id: id,
          __v: data.__v,
        },
        {
          name: data.name,
          parent: data.parent,
          remark: data.remark,
        }
      )
      .exec()
      .then((result) => {
        if (result) {
          response.message = 'LOV updated successfully'
          response.statusCode = `${modCodes[this.constructor.name]}_U_${
            modCodes.Global.success
          }`
          response.payload = result
        } else {
          response.message = `LOV failed to update. Invalid document`
          response.statusCode = `${modCodes[this.constructor.name]}_U_${
            modCodes.Global.failed
          }`
          response.payload = {}
        }
      })
      .catch((error: Error) => {
        response.message = `LOV failed to update. ${error.message}`
        response.statusCode = `${modCodes[this.constructor.name]}_U_${
          modCodes.Global.failed
        }`
      })
    return response
  }

  async delete(id: string): Promise<GlobalResponse> {
    const response = {
      statusCode: '',
      message: '',
      payload: {},
      transaction_classify: 'LOV_DELETE',
      transaction_id: null,
    } satisfies GlobalResponse
    const data = await this.lovModel.findOne({
      id: id,
    })

    if (data) {
      data.deleted_at = new TimeManagement().getTimezone('Asia/Jakarta')

      await data
        .save()
        .then((result) => {
          response.message = 'LOV deleted successfully'
          response.statusCode = `${modCodes[this.constructor.name]}_D_${
            modCodes.Global.success
          }`
        })
        .catch((error: Error) => {
          response.message = `LOV failed to delete. ${error.message}`
          response.statusCode = `${modCodes[this.constructor.name]}_D_${
            modCodes.Global.failed
          }`
          response.payload = error
        })
    } else {
      response.message = `LOV failed to deleted. Invalid document`
      response.statusCode = `${modCodes[this.constructor.name]}_D_${
        modCodes.Global.failed
      }`
      response.payload = {}
    }
    return response
  }
}
