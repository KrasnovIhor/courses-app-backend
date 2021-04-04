import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Observable, Subscriber } from 'rxjs';

import { UserModel } from '@auth/auth.models';

import { METADATA_AUTHORIZED_KEY } from './core-module.config';
import { getTokenWithoutBearer } from './token.helpers';
import { TokenVerificationResult } from './token.models';
import { TokenService } from './token.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Observable<boolean> {
    const authorized = this.reflector.get<boolean>(
      METADATA_AUTHORIZED_KEY,
      context.getHandler(),
    );

    if (!authorized) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const {
      headers: { authorization },
    } = request;

    if (!authorization || !authorization.startsWith('Bearer')) {
      return false;
    }

    return new Observable((subscriber: Subscriber<boolean>) => {
      const authorizationWithoutBearer = getTokenWithoutBearer(authorization);

      this.tokenService.verify(
        authorizationWithoutBearer,
        (result: TokenVerificationResult<UserModel>) => {
          if (result.error) {
            throw new HttpException(
              { successful: false },
              HttpStatus.UNAUTHORIZED,
            );
          }

          request.user = result.user;

          subscriber.next(true);
          subscriber.complete();
        },
      );
    });
  }
}
