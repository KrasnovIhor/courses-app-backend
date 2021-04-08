import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import * as path from 'path';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  FailedRequest,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { ModelValidation } from '@helpers/decorators';
import { jsonReader } from '@helpers/file-reader.helper';
import { jsonWriter } from '@helpers/file-writer.helper';

import { FILES_FOLDER, UserRoles } from '@core/core-module.config';
import { getTokenWithoutBearer } from '@core/token.helpers';
import { TokenService } from '@core/token.service';

import { User, UserModel } from './auth.models';

@Injectable()
export class AuthService {
  private readonly filePath = path.join(this.filesFolder, 'users.json');

  constructor(
    private tokenService: TokenService,
    @Inject(FILES_FOLDER) private filesFolder: string,
  ) {}

  @ModelValidation<UserModel, User>(User)
  login(
    user: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return jsonReader
      .getSingleObject<UserModel>(
        this.filePath,
        (user as unknown) as QueryParams,
      )
      .pipe(
        map((user: SuccessfulRequest<UserModel | null>) => {
          if (user.result) {
            const accessToken = this.tokenService.sign(user.result);

            return {
              successful: true,
              result: 'Bearer ' + accessToken,
              user: {
                email: user.result.email,
                name: user.result.name,
              },
            } as SuccessfulRequest<string>;
          }

          throw new HttpException(
            { successful: false, result: 'Invalid data.' },
            HttpStatus.BAD_REQUEST,
          );
        }),
        catchError((err: FailedRequest) => {
          if (err.message === 'Error during file reading.') {
            throw new HttpException(
              { successful: false, result: 'Invalid data.' },
              HttpStatus.BAD_REQUEST,
            );
          }

          return throwError(err);
        }),
      );
  }

  @ModelValidation<UserModel, User>(User, {
    nameRequired: true,
    emailRequired: true,
    passwordRequired: true,
  })
  register(
    user: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    const userWithRole = {
      ...user,
      role: UserRoles.user,
    };

    return jsonWriter.addObject<UserModel>(this.filePath, userWithRole).pipe(
      map((result: SuccessfulRequest<string>) => ({
        ...result,
        result: 'User was created.',
      })),
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during file reading.') {
          return jsonWriter
            .createJSON<UserModel>(this.filePath, userWithRole)
            .pipe(
              map((result: SuccessfulRequest<string>) => ({
                ...result,
                result: 'User was created.',
              })),
              catchError((err: FailedRequest) => of(err)),
            );
        }

        return of(err);
      }),
    );
  }

  logout(tokenWithBearer: string): Observable<void> {
    const token = getTokenWithoutBearer(tokenWithBearer);
    this.tokenService.destroy(token);

    return of(null);
  }
}
