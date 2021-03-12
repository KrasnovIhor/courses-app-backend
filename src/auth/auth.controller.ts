import {
  Body,
  Controller,
  Delete,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { FailedRequest, SuccessfulRequest } from '@models/common.models';

import { Authorized } from '@helpers/decorators';

import { AuthorizationGuard } from '@core/authorization.guard';

import { UserModel } from './auth.models';
import { AuthService } from './auth.service';

@Controller()
@UseGuards(AuthorizationGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(
    @Body() body: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authService.login(body);
  }

  @Post('register')
  register(
    @Body() body: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authService.register(body);
  }

  @Delete('logout')
  @Authorized()
  logout(
    @Headers('authorization') token: string,
  ): Observable<void | FailedRequest> {
    return this.authService.logout(token);
  }
}
