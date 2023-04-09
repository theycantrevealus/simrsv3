import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { KafkaConn } from '@utility/kafka'

import { CoreModule } from '../../core/src/core.module'
import { InventoryModule } from './inventory.module'

declare const module: any
async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(CoreModule)
  const configService = appContext.get(ConfigService)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryModule,
    await KafkaConn.inventory[0].useFactory(configService)
  )
  app.listen()
}
bootstrap()
