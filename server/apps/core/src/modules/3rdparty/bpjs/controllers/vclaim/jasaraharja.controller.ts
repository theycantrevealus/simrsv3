import { SPRIAdd } from '@core/3rdparty/bpjs/dto/spri/add'
import { BPJSVClaimAuthService } from '@core/3rdparty/bpjs/services/vclaim/auth.service'
import { Authorization } from '@decorators/authorization'
import { JwtAuthGuard } from '@guards/jwt'
import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { WINSTON_MODULE_PROVIDER } from '@utility/logger/constants'
import { Logger } from 'winston'

@Controller('bpjs')
@ApiTags('Integration - Badan Penyelenggara Jaminan Sosial')
export class BPJSVClaimJasaRaharjaController {
  constructor(
    @Inject(BPJSVClaimAuthService)
    private readonly bpjsAuth: BPJSVClaimAuthService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger
  ) {}

  @Post('jasa_raharja/suplesi')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Authorization(true)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Polyclinic',
    description: 'Get BPJS polyclinic list',
  })
  async rencanaKontrolAdd(@Body() parameter: SPRIAdd) {}
}
