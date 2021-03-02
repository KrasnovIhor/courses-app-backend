import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserModel } from 'auth/auth.models';
import { Observable, Subscriber } from 'rxjs';

import { METADATA_AUTHORIZED_KEY } from './core-module.config';
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

    const {
      headers: { authorization },
    } = context.switchToHttp().getRequest();

    if (!authorization) {
      return false;
    }

    return new Observable((subscriber: Subscriber<boolean>) => {
      this.tokenService.verify(
        authorization,
        (result: TokenVerificationResult<UserModel>) => {
          if (result.error) {
            throw new HttpException(
              { successful: false },
              HttpStatus.UNAUTHORIZED,
            );
          }

          subscriber.next(true);
          subscriber.complete();
        },
      );
    });
  }
}
