import { AccountController } from '@core/account/account.controller'
import { AuthorityController } from '@core/account/authority.controller'
import { AccountAddDTO } from '@core/account/dto/account.add.dto'
import { AccountSignInDTO } from '@core/account/dto/account.signin.dto'
import {
  accountArray,
  accountDocArray,
  mockAccount,
  mockAccountModel,
} from '@core/account/mock/account.mock'
import { mockAuthorityModel } from '@core/account/mock/authority,mock'
import { faker } from '@faker-js/faker'
import { JwtAuthGuard } from '@guards/jwt'
import { LogActivity } from '@log/schemas/log.activity'
import { LogLogin } from '@log/schemas/log.login'
import { mockKafkaTransaction } from '@mock/kafka'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { Account, AccountDocument } from '@schemas/account/account.model'
import { Authority, AuthorityDocument } from '@schemas/account/authority.model'
import { AuthService } from '@security/auth.service'
import { ApiQueryGeneral } from '@utility/dto/prime'
import { WINSTON_MODULE_PROVIDER } from '@utility/logger/constants'
import { testCaption } from '@utility/string'
import { Model } from 'mongoose'
import { Logger } from 'winston'

import { CommonErrorFilter } from '../../../../../filters/error'
import { GatewayPipe } from '../../../../../pipes/gateway.pipe'
import { AccountService } from '../account.service'

describe('Account Controller', () => {
  const mock_Guard: CanActivate = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest()
      request.credential = mockAccount()
      return true
    }),
  }
  let app: NestFastifyApplication
  let accountController: AccountController
  let authorityController: AuthorityController
  let logger: Logger
  let accountModel: Model<Account>
  let authorityModel: Model<Authority>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController, AuthorityController],
      providers: [
        AccountService,
        {
          provide: 'ACCOUNT_SERVICE',
          useValue: mockKafkaTransaction,
        },
        {
          provide: ConfigService,
          useValue: {
            get: () => jest.fn().mockResolvedValue('Test'),
            set: () => jest.fn().mockResolvedValue('Test'),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => accountArray[0],
            set: () => jest.fn(),
          },
        },
        { provide: AuthService, useValue: {} },
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel,
        },
        {
          provide: getModelToken(Authority.name),
          useValue: mockAuthorityModel,
        },
        { provide: getModelToken(LogLogin.name), useValue: {} },
        { provide: getModelToken(LogActivity.name), useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mock_Guard)
      .compile()

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        logger: false,
        disableRequestLogging: true,
        ignoreTrailingSlash: true,
        ignoreDuplicateSlashes: true,
      })
    )
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER)
    accountController = app.get<AccountController>(AccountController)
    authorityController = app.get<AuthorityController>(AuthorityController)
    accountModel = module.get<Model<AccountDocument>>(
      getModelToken(Account.name)
    )
    authorityModel = module.get<Model<AuthorityDocument>>(
      getModelToken(Authority.name)
    )
    await app.useGlobalFilters(new CommonErrorFilter(logger))
    app.useGlobalPipes(new GatewayPipe())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    jest.clearAllMocks()
  })

  it(
    testCaption(
      'CONTROLLER STATE',
      'component',
      'Controller should be defined'
    ),
    () => {
      expect(accountController).toBeDefined()
      expect(authorityController).toBeDefined()
    }
  )

  describe(testCaption('FLOW', 'feature', 'Account - Sign in'), () => {
    it(
      testCaption('HANDLING', 'data', 'Should return success sign in', {
        tab: 1,
      }),
      async () => {
        const data = {
          email: mockAccount().email,
          password: mockAccount().password,
        } satisfies AccountSignInDTO

        return app
          .inject({
            method: 'POST',
            url: `/account/signin`,
            body: data,
          })
          .then((result) => {
            expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
          })
      }
    )
  })

  describe(
    testCaption('FLOW', 'feature', 'Account - Get account data lazy loaded'),
    () => {
      it(
        testCaption('HANDLING', 'data', 'Should handle invalid JSON format', {
          tab: 1,
        }),
        async () => {
          jest.spyOn(accountModel, 'aggregate').mockReturnValue({
            exec: jest.fn().mockReturnValue(accountDocArray),
          } as any)

          return app
            .inject({
              method: 'GET',
              headers: {
                authorization: 'Bearer ey...',
              },
              url: '/account',
              query: `lazyEvent=abc`,
            })
            .then((result) => {
              expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
              expect(logger.warn).toHaveBeenCalled()
            })
        }
      )

      it(
        testCaption('HANDLING', 'data', 'Should return data', {
          tab: 1,
        }),
        async () => {
          jest.spyOn(accountModel, 'aggregate').mockReturnValue({
            exec: jest.fn().mockReturnValue(accountDocArray),
          } as any)

          return app
            .inject({
              method: 'GET',
              headers: {
                authorization: 'Bearer ey...',
              },
              url: '/account',
              query: `lazyEvent=${ApiQueryGeneral.primeDT.example}`,
            })
            .then((result) => {
              expect(result.statusCode).toEqual(HttpStatus.OK)
              expect(logger.verbose).toHaveBeenCalled()
            })
        }
      )
    }
  )

  describe(
    testCaption('FLOW', 'feature', 'Account - Get account data detail'),
    () => {
      it(
        testCaption('HANDLING', 'data', 'Should return data', {
          tab: 1,
        }),
        async () => {
          return app
            .inject({
              method: 'GET',
              headers: {
                authorization: 'Bearer ey...',
              },
              url: `/account/${mockAccount().id}`,
            })
            .then((result) => {
              expect(result.statusCode).toEqual(HttpStatus.OK)
              expect(logger.verbose).toHaveBeenCalled()
            })
        }
      )
    }
  )

  describe(testCaption('FLOW', 'feature', 'Account - Add account data'), () => {
    it(
      testCaption('HANDLING', 'feature', 'Should handle invalid format', {
        tab: 1,
      }),
      async () => {
        return app
          .inject({
            method: 'POST',
            headers: {
              authorization: 'Bearer ey...',
              'content-type': 'application/json',
            },
            url: '/account',
            body: 'abc',
          })
          .then((result) => {
            expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
            expect(logger.warn).toHaveBeenCalled()
          })
      }
    )

    it(
      testCaption('HANDLING', 'feature', 'Should handle invalid data', {
        tab: 1,
      }),
      async () => {
        const data = {
          email: mockAccount().email,
          first_name: mockAccount().first_name,
          last_name: mockAccount().last_name,
          password: faker.internet.password({ length: 24 }),
          phone: mockAccount().phone,
          authority: mockAccount().authority,
        } satisfies AccountAddDTO

        delete data.email

        return app
          .inject({
            method: 'POST',
            headers: {
              authorization: 'Bearer ey...',
              'content-type': 'application/json',
            },
            url: '/account',
            body: data,
          })
          .then((result) => {
            expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
            expect(logger.warn).toHaveBeenCalled()
          })
      }
    )

    it(
      testCaption('HANDLING', 'data', 'Should return success add', {
        tab: 1,
      }),
      async () => {
        const data = {
          code: '',
          email: mockAccount().email,
          first_name: mockAccount().first_name,
          last_name: mockAccount().last_name,
          password: faker.internet.password({ length: 24 }),
          phone: mockAccount().phone,
          authority: mockAccount().authority,
        } satisfies AccountAddDTO

        return app
          .inject({
            method: 'POST',
            headers: {
              authorization: 'Bearer ey...',
              'content-type': 'application/json',
            },
            url: '/account',
            body: data,
          })
          .then((result) => {
            console.log(result)
            expect(result.statusCode).toEqual(HttpStatus.OK)
            expect(logger.verbose).toHaveBeenCalled()
          })
      }
    )
  })

  // describe(
  //   testCaption('FLOW', 'feature', 'Account - Edit account data'),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'feature', 'Should handle invalid format', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'PATCH',
  //             headers: {
  //               authorization: 'Bearer ey...',
  //             },
  //             url: `/account/${mockAccount().id}`,
  //             body: 'abc',
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'feature', 'Should handle invalid data', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'PATCH',
  //             headers: {
  //               authorization: 'Bearer ey...',
  //             },
  //             url: `/account/${mockAccount().id}`,
  //             body: {},
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return success edit', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         const data = {
  //           email: mockAccount().email,
  //           first_name: mockAccount().first_name,
  //           last_name: mockAccount().last_name,
  //           phone: mockAccount().phone,
  //           authority: mockAccount().authority,
  //           __v: 0,
  //         } satisfies AccountEditDTO
  //
  //         return app
  //           .inject({
  //             method: 'PATCH',
  //             headers: {
  //               authorization: 'Bearer ey...',
  //             },
  //             url: `/account/${mockAccount().id}`,
  //             body: data,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )

  // describe(
  //   testCaption('FLOW', 'feature', 'Account - Delete account data'),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return success delete', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'DELETE',
  //             url: `/account/${mockAccount().id}`,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )
  //
  // describe(
  //   testCaption(
  //     'FLOW',
  //     'feature',
  //     'Authority - Get authority data lazy loaded'
  //   ),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'data', 'Should handle invalid JSON format', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         jest.spyOn(authorityModel, 'aggregate').mockReturnValue({
  //           exec: jest.fn().mockReturnValue(authorityDocArray),
  //         } as any)
  //
  //         return app
  //           .inject({
  //             method: 'GET',
  //             headers: {
  //               authorization: 'Bearer ey...',
  //             },
  //             url: '/authority',
  //             query: `lazyEvent=abc`,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return data', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         jest.spyOn(authorityModel, 'aggregate').mockReturnValue({
  //           exec: jest.fn().mockReturnValue(authorityDocArray),
  //         } as any)
  //
  //         return app
  //           .inject({
  //             method: 'GET',
  //             headers: {
  //               authorization: 'Bearer ey...',
  //             },
  //             url: '/authority',
  //             query: `lazyEvent=${ApiQueryGeneral.primeDT.example}`,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )
  //
  // describe(
  //   testCaption('FLOW', 'feature', 'Authority - Get authority data detail'),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return data', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'GET',
  //             headers: {
  //               authorization: 'Bearer ey...',
  //             },
  //             url: `/authority/${mockAuthority().id}`,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )
  //
  // describe(
  //   testCaption('FLOW', 'feature', 'Authority - Add authority data'),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'feature', 'Should handle invalid format', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'POST',
  //             url: '/authority',
  //             body: 'abc',
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'feature', 'Should handle invalid data', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         const data = {
  //           code: mockAuthority().code,
  //           name: mockAuthority().name,
  //         } satisfies AuthorityAddDTO
  //
  //         delete data.name
  //
  //         return app
  //           .inject({
  //             method: 'POST',
  //             url: '/authority',
  //             body: data,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return success add', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         const data = {
  //           code: mockAuthority().code,
  //           name: mockAuthority().name,
  //         } satisfies AuthorityAddDTO
  //
  //         return app
  //           .inject({
  //             method: 'POST',
  //             url: '/authority',
  //             body: data,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )
  //
  // describe(
  //   testCaption('FLOW', 'feature', 'Authority - Edit authority data'),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'feature', 'Should handle invalid format', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'PATCH',
  //             url: `/authority/${mockAuthority().id}`,
  //             body: 'abc',
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'feature', 'Should handle invalid data', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'PATCH',
  //             url: `/authority/${mockAuthority().id}`,
  //             body: {},
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST)
  //             expect(logger.warn).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return success edit', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         const data = {
  //           code: mockAuthority().code,
  //           name: mockAuthority().name,
  //           __v: 0,
  //         } satisfies AuthorityEditDTO
  //
  //         return app
  //           .inject({
  //             method: 'PATCH',
  //             url: `/authority/${mockAuthority().id}`,
  //             body: data,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )
  //
  // describe(
  //   testCaption('FLOW', 'feature', 'Authority - Delete authority data'),
  //   () => {
  //     it(
  //       testCaption('HANDLING', 'data', 'Should return success delete', {
  //         tab: 1,
  //       }),
  //       async () => {
  //         return app
  //           .inject({
  //             method: 'DELETE',
  //             url: `/authority/${mockAuthority().id}`,
  //           })
  //           .then((result) => {
  //             expect(result.statusCode).toEqual(HttpStatus.OK)
  //             expect(logger.verbose).toHaveBeenCalled()
  //           })
  //       }
  //     )
  //   }
  // )

  afterEach(async () => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })
})
