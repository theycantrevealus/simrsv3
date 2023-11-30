import { IMasterQueue } from '@core/master/interface/master.queue'
import { ConsumerGeneralDataDTO } from '@utility/dto/consumer'

class ConsumerQueueDataDTO {
  machine: IMasterQueue
}

export class ConsumerQueueDTO extends ConsumerGeneralDataDTO {
  data: ConsumerQueueDataDTO
}
