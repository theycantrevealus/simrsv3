export const ApplicationConfig = () => ({
  application: {
    name: process.env.APP_NAME,
    host: process.env.APP_HOST,
    port: process.env.APP_PORT,
    host_port: process.env.APP_HOST_PORT,
    images: {
      core_dir: process.env.APP_CORE_DIR,
      core_prefix: process.env.APP_CORE_PREFIX,
    },
    node_env: process.env.NODE_ENV,
    timezone: parseInt(process.env.TIMEZONE) * 60 * 60 * 1000,
    jwt: 'TAKASHITANAKA0192',
    log: {
      info: process.env.LOG_INFO,
      verbose: process.env.LOG_VERBOSE,
      warn: process.env.LOG_WARN,
      debug: process.env.LOG_DEBUG,
      error: process.env.LOG_ERROR,
    },
    token: '',
  },
})
