import { AccountService } from '@core/account/account.service'
import { mockAccount } from '@core/account/mock/account.mock'
import { Account } from '@core/account/schemas/account.model'
import {
  MasterItemBrandAddDTO,
  MasterItemBrandEditDTO,
} from '@core/master/dto/master.item.brand'
import { MasterItemBrandService } from '@core/master/master.item.brand.service'
import {
  masterItemBrandDocArray,
  mockMasterItemBrand,
  mockMasterItemBrandModel,
} from '@core/master/mock/master.item.brand.mock'
import {
  MasterItemBrand,
  MasterItemBrandDocument,
} from '@core/master/schemas/master.item.brand'
import { createMock } from '@golevelup/ts-jest'
import { LogActivity } from '@log/schemas/log.activity'
import { LogLogin } from '@log/schemas/log.login'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '@security/auth.service'
import { GlobalResponse } from '@utility/dto/response'
import { testCaption } from '@utility/string'
import { Model, Query, Types } from 'mongoose'

describe('Master Item Brand Service', () => {
  let service: MasterItemBrandService
  let model: Model<MasterItemBrand>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        MasterItemBrandService,
        AccountService,
        AuthService,
        JwtService,
        {
          provide: getModelToken(MasterItemBrand.name),
          useValue: mockMasterItemBrandModel,
        },
        {
          provide: getModelToken(Account.name),
          useValue: {},
        },
        { provide: getModelToken(LogActivity.name), useValue: {} },
        { provide: getModelToken(LogLogin.name), useValue: {} },
      ],
    }).compile()

    service = module.get<MasterItemBrandService>(MasterItemBrandService)
    model = module.get<Model<MasterItemBrandDocument>>(
      getModelToken(MasterItemBrand.name)
    )

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it(
    testCaption('SERVICE STATE', 'component', 'Service should be defined'),
    () => {
      expect(service).toBeDefined()
    }
  )

  it(testCaption('DATA', 'data', 'Should list all data'), async () => {
    jest.spyOn(model, 'aggregate').mockReturnValue({
      exec: jest.fn().mockReturnValue(masterItemBrandDocArray),
    } as any)

    const getData = await service.all({
      first: 0,
      rows: 10,
      sortField: 'created_at',
      sortOrder: 1,
      filters: {},
    })

    expect(getData.payload.data).toEqual(masterItemBrandDocArray)
  })

  it(
    testCaption('DATA', 'data', 'Should show master item brand detail'),
    async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce(
        createMock<Query<MasterItemBrandDocument, MasterItemBrandDocument>>({
          exec: jest.fn().mockResolvedValueOnce(masterItemBrandDocArray[0]),
        }) as any
      )

      const findMock = masterItemBrandDocArray[0]
      const foundData = await service.detail(masterItemBrandDocArray[0].id)
      expect(foundData).toEqual(findMock)
    }
  )

  it(
    testCaption('DATA', 'data', 'Should create a new master item brand'),
    async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => {
        return Promise.resolve(masterItemBrandDocArray[0])
      })

      const newEntry = (await service.add(
        new MasterItemBrandAddDTO(mockMasterItemBrand()),
        mockAccount()
      )) satisfies GlobalResponse
      expect(newEntry.payload).toHaveProperty('code')
    }
  )

  it(
    testCaption('DATA', 'data', 'Should edit master item brand data'),
    async () => {
      jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(
        createMock<Query<MasterItemBrandDocument, MasterItemBrandDocument>>({
          exec: jest.fn().mockResolvedValueOnce(masterItemBrandDocArray[0]),
        }) as any
      )

      const data = (await service.edit(
        new MasterItemBrandEditDTO(masterItemBrandDocArray[0]),
        `brand-${new Types.ObjectId().toString()}`
      )) satisfies GlobalResponse
      expect(data.payload).toHaveProperty('code')
    }
  )

  afterAll(async () => {
    jest.clearAllMocks()
  })
})
