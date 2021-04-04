import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';

import { SuccessfulRequest } from '@models/common.models';

import { Authorized } from '@helpers/decorators';

import { User } from '@auth/auth.models';
import { AuthorizationGuard } from '@core/authorization.guard';
import { METADATA_AUTHORIZED_KEY } from '@core/core-module.config';

@Controller('users')
@ApiTags('Users')
@UseGuards(AuthorizationGuard)
export class UsersController {
  @Get('me')
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  getAllAuthors(@Request() req: any): SuccessfulRequest<User> {
    return {
      successful: true,
      result: req.user,
    };
  }
}
