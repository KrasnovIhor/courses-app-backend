import {
  Body,
  Controller,
  Delete,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { FailedRequest, SuccessfulRequest } from '@models/common.models';

import { Authorized } from '@helpers/decorators';

import { AuthorizationGuard } from '@core/authorization.guard';
import { METADATA_AUTHORIZED_KEY } from '@core/core-module.config';
import { SwaggerUser } from '@swagger/models';

import { UserModel } from './auth.models';
import { AuthService } from './auth.service';

@Controller()
@ApiTags('Auth')
@UseGuards(AuthorizationGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({
    type: SwaggerUser,
  })
  login(
    @Body() body: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiBody({
    type: SwaggerUser,
  })
  register(
    @Body() body: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authService.register(body);
  }

  @Delete('logout')
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  logout(
    @Headers(METADATA_AUTHORIZED_KEY) token: string,
  ): Observable<void | FailedRequest> {
    return this.authService.logout(token);
  }
}
