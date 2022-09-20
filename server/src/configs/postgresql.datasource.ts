import { DataSource } from 'typeorm'
import entities from './entities'
require('dotenv').config()
const isProduction = process.env.MODE != 'development'
let databaseHost,
  databasePort,
  databaseUsername,
  databasePassword,
  databaseName,
  databaseLogging = ''
if (isProduction) {
  databaseHost = process.env.DB_PROD_HOST
  databasePort = process.env.DB_PROD_PORT
  databaseUsername = process.env.DB_PROD_USERNAME
  databasePassword = process.env.DB_PROD_PASSWORD
  databaseName = process.env.DB_PROD_NAME
  databaseLogging = process.env.DB_PROD_LOGGING
} else {
  databaseHost = process.env.DB_DEV_HOST
  databasePort = process.env.DB_DEV_PORT
  databaseUsername = process.env.DB_DEV_USERNAME
  databasePassword = process.env.DB_DEV_PASSWORD
  databaseName = process.env.DB_DEV_NAME
  databaseLogging = process.env.DB_DEV_LOGGING
}
const loggingOption: any = databaseLogging.split(',')
const AppDataSource = new DataSource({
  type: 'postgres',
  name: 'default',
  host: databaseHost,
  port: parseInt(databasePort),
  username: databaseUsername,
  password: databasePassword,
  database: databaseName,
  logging: loggingOption,
  entities: entities,
  migrationsTransactionMode: 'each',
  migrationsTableName: 'migrations',
  migrations: ['src/migrations/**/*{.ts,.js}'],
  subscribers: ['src/subscribers/**/*{.ts,.js}'],
  migrationsRun: true,
})

export { AppDataSource }
