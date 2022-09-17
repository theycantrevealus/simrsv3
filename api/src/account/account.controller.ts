import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Param,
  Put,
  UseInterceptors,
  Delete,
  Logger,
  Query,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiParam, ApiOperation } from '@nestjs/swagger'
import { AccountService } from './account.service'
import { AccountLoginDTO } from './dto/account'
import { AccountAddDTO } from './dto/account.add.dto'
import { Authorization } from '../decorator/auth.decorator'
import { JwtAuthGuard } from '../guard/jwt.guard'
import { AccountEditDTO } from './dto/account.edit.dto'
import { LoggingInterceptor } from '../interceptor/logging'
import { isJsonString } from '../mod.lib'

@Controller('account')
@ApiTags('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  private logger = new Logger('HTTP')

  //=========================================================================================== CREDENTIAL   SECTION
  @Post('login')
  async login(@Body() data: AccountLoginDTO) {
    return this.accountService.login(data)
  }

  //=========================================================================================== ACCOUNT SECTION

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all user' })
  @Authorization(true)
  @Get()
  async list() {
    return await this.accountService.all()
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all user (Paginate)' })
  @Authorization(true)
  @Get('paginate')
  async paginate(
    @Query('first') first: number,
    @Query('rows') rows: number,
    @Query('sortOrder') sortOrder: number,
    @Query('sortField') sortField: string,
    @Query('filters') filters: any,
  ) {
    const filterSet = isJsonString(filters) ? JSON.parse(filters) : {}

    // this.logger.log({
    //   rows: rows,
    //   first: first,
    //   sortOrder: sortOrder,
    //   sortField: sortField,
    //   filter: filterSet
    // })

    // for (const queryKey of Object.keys(filterSet)) {
    //   this.logger.log(`${queryKey}: ${filterSet[queryKey]}`)
    // }

    const data = await this.accountService.paginate({
      rows: rows,
      first: first,
      sortOrder: sortOrder,
      sortField: sortField,
      filter: filterSet,
    })

    // this.logger.log(data)

    return data
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @ApiParam({
    name: 'uid',
  })
  @Get(':uid/detail')
  async detail(@Param() param) {
    return await this.accountService.detail(param.uid)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @ApiParam({
    name: 'uid',
  })
  @UseInterceptors(LoggingInterceptor)
  @Delete(':uid/delete')
  async delete_soft(@Param() param) {
    return await this.accountService.delete_soft(param.uid)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @Post('add')
  @UseInterceptors(LoggingInterceptor)
  async add(@Body() data: AccountAddDTO) {
    return await this.accountService.add(data)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @ApiParam({
    name: 'uid',
  })
  @UseInterceptors(LoggingInterceptor)
  @Put(':uid/edit')
  async edit(@Body() data: AccountEditDTO, @Param() param) {
    return await this.accountService.edit(data, param.uid)
  }
}
