import { Account } from '@core/account/schemas/account.model'
import {
  MasterQueueAddDTO,
  MasterQueueEditDTO,
} from '@core/master/dto/master.queue'
import { MasterQueue } from '@core/master/schemas/master.queue.machine'
import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { GlobalResponse } from '@utility/dto/response'
import { modCodes } from '@utility/modules'
import { prime_datatable } from '@utility/prime'
import { TimeManagement } from '@utility/time'
import { Model } from 'mongoose'

@Injectable()
export class MasterQueueService {
  constructor(
    @InjectModel(MasterQueue.name)
    private masterQueueModel: Model<MasterQueue>
  ) {}

  async all(parameter: any) {
    return await prime_datatable(parameter, this.masterQueueModel)
  }

  async detail(id: string): Promise<MasterQueue> {
    return this.masterQueueModel.findOne({ id: id }).exec()
  }

  async add(
    data: MasterQueueAddDTO,
    account: Account
  ): Promise<GlobalResponse> {
    const response = {
      statusCode: {
        defaultCode: HttpStatus.OK,
        customCode: modCodes.Global.success,
        classCode: modCodes[this.constructor.name].default,
      },
      message: '',
      payload: {},
      transaction_classify: 'MASTER_QUEUE_ADD',
      transaction_id: null,
    } satisfies GlobalResponse

    await this.masterQueueModel
      .create({
        ...data,
        created_by: account,
      })
      .then((result) => {
        response.message = 'Master queue created successfully'
        response.transaction_id = result._id
        response.payload = result
      })
      .catch((error: Error) => {
        response.message = `Master queue failed to create. ${error.message}`
        response.statusCode =
          modCodes[this.constructor.name].error.databaseError
        response.payload = error
        throw new Error(JSON.stringify(response))
      })

    return response
  }

  async edit(data: MasterQueueEditDTO, id: string): Promise<GlobalResponse> {
    const response = {
      statusCode: {
        defaultCode: HttpStatus.OK,
        customCode: modCodes.Global.success,
        classCode: modCodes[this.constructor.name].default,
      },
      message: '',
      payload: {},
      transaction_classify: 'MASTER_QUEUE_EDIT',
      transaction_id: null,
    } satisfies GlobalResponse

    await this.masterQueueModel
      .findOneAndUpdate(
        {
          id: id,
          __v: data.__v,
        },
        {
          code: data.code,
          remark: data.remark,
        }
      )
      .exec()
      .then((result) => {
        if (result) {
          response.message = 'Master queue updated successfully'
          response.payload = result
        } else {
          response.message = `Master queue failed to update. Invalid document`
          response.statusCode =
            modCodes[this.constructor.name].error.databaseError
          throw new Error(JSON.stringify(response))
        }
      })
      .catch((error: Error) => {
        response.message = `Master queue failed to update. ${error.message}`
        response.statusCode =
          modCodes[this.constructor.name].error.databaseError
        response.payload = error
        throw new Error(JSON.stringify(response))
      })
    return response
  }

  async delete(id: string): Promise<GlobalResponse> {
    const response = {
      statusCode: {
        defaultCode: HttpStatus.OK,
        customCode: modCodes.Global.success,
        classCode: modCodes[this.constructor.name].default,
      },
      message: '',
      payload: {},
      transaction_classify: 'MASTER_ITEM_BRAND_DELETE',
      transaction_id: null,
    } satisfies GlobalResponse
    const data = await this.masterQueueModel.findOne({
      id: id,
    })

    if (data) {
      data.deleted_at = new TimeManagement().getTimezone('Asia/Jakarta')

      await data
        .save()
        .then(() => {
          response.message = 'Master queue deleted successfully'
        })
        .catch((error: Error) => {
          response.message = `Master queue failed to delete. ${error.message}`
          response.statusCode =
            modCodes[this.constructor.name].error.databaseError
          response.payload = error
          throw new Error(JSON.stringify(response))
        })
    } else {
      response.message = `Master queue failed to deleted. Invalid document`
      response.statusCode = modCodes[this.constructor.name].error.databaseError
      throw new Error(JSON.stringify(response))
    }
    return response
  }
}
