import { Controller, Body, Post, UseGuards, Get, HttpStatus, Param, Put, UseInterceptors, Delete, Req, Logger, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiParam, ApiOperation } from '@nestjs/swagger'
import { AccountService } from './account.service'
import { AccountLoginDTO } from './dto/account'
import { AccountAddDTO, AccountAddDTOResponse } from './dto/account.add.dto'
import { CredentialAccount, Authorization } from '../decorator/auth.decorator'
import { JwtAuthGuard } from '../guard/jwt.guard'
import { AccountEditDTO, AccountEditDTOResponse } from './dto/account.edit.dto'
import { AuthorityService } from './authority.service'
import { LoggingInterceptor } from '../interceptor/logging'
import { GrantAccessDTO } from '../menu/dto/menu.grant.privileges.dto'
import { CredentialInterceptor } from '../interceptor/credential'
import { LocalGuard } from '../guard/local.guard'

@Controller('account')
@ApiTags('account')
export class AccountController {
  constructor(
    private accountService: AccountService
  ) { }

  private logger = new Logger('HTTP')

  //=========================================================================================== CREDENTIAL   SECTION
  @Post('login')
  async login (@Body() data: AccountLoginDTO) {
    return this.accountService.login(data)
  }

  //=========================================================================================== ACCOUNT SECTION

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all user' })
  @Authorization(true)
  @Get()
  async list () {
    return this.accountService.all()
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @ApiParam({
    name: 'uid'
  })
  @Get(':uid/detail')
  async detail (@Param() param) {
    return await this.accountService.detail(param.uid)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @ApiParam({
    name: 'uid'
  })
  @UseInterceptors(LoggingInterceptor)
  @Delete(':uid/delete')
  async delete_soft (@Param() param) {
    return await this.accountService.delete_soft(param.uid)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @Post('add')
  @UseInterceptors(LoggingInterceptor)
  async add (@Body() data: AccountAddDTO) {
    return await this.accountService.add(data)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @Post('grant_access')
  @UseInterceptors(LoggingInterceptor)
  async grant_access (@Body() data: GrantAccessDTO, @CredentialAccount() credential) {
    return await this.accountService.grant_access(data, credential)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Authorization(true)
  @ApiParam({
    name: 'uid'
  })
  @UseInterceptors(LoggingInterceptor)
  @Put(':uid/edit')
  async edit (@Body() data: AccountEditDTO, @Param() param) {
    return await this.accountService.edit(data, param.uid)
  }
}
