import { Controller, HttpStatus, Inject, UseFilters } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { ProceedDataTrafficDTO } from '@socket/dto/neuron'
import { SocketIoClientProxyService } from '@socket/socket.proxy'
import { KafkaTopic } from '@utility/decorator'
import { GlobalResponse } from '@utility/dto/response'
import { WINSTON_MODULE_PROVIDER } from '@utility/logger/constants'
import { modCodes } from '@utility/modules'
import { Logger } from 'winston'

import { CommonErrorFilter } from '../../filters/error'
import { ConsumerQueueService } from './queue.service'

@Controller('queue')
export class ConsumerQueueController {
  constructor(
    @Inject(SocketIoClientProxyService)
    private readonly socketProxy: SocketIoClientProxyService,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @Inject(ConsumerQueueService)
    private readonly consumerQueueService: ConsumerQueueService
  ) {}

  @KafkaTopic('KAFKA_TOPICS')
  @UseFilters(CommonErrorFilter)
  async queue(@Payload() payload) {
    const response = {
      statusCode: {
        defaultCode: HttpStatus.OK,
        customCode: modCodes.Global.success,
        classCode: modCodes[this.constructor.name].defaultCode,
      },
      message: '',
      payload: {},
      transaction_classify: 'QUEUE',
      transaction_id: null,
    } satisfies GlobalResponse

    try {
      switch (payload.action) {
        case 'add':
          return await this.consumerQueueService
            .add(payload.id, payload.data, payload.account)
            .then(async (response) => {
              return await this.socketProxy
                .reconnect({
                  extraHeaders: {
                    Authorization: payload.token,
                  },
                })
                .then(async (clientSet) => {
                  response.message = 'New queue created'
                  await clientSet
                    .emit('queue', {
                      sender: payload.account,
                      receiver: null,
                      payload: response,
                    } satisfies ProceedDataTrafficDTO)
                    .then(async () => {
                      await clientSet.disconnect()
                      return response
                    })
                })
            })
          break
        case 'edit':
          break
        default:
          this.logger.error(`Unknown message payload received: ${payload}`)
      }
    } catch (error) {
      response.message = error.message
      response.statusCode = modCodes[this.constructor.name].error.databaseError
      response.payload = error
      throw new Error(JSON.stringify(error))
    }
  }
}
