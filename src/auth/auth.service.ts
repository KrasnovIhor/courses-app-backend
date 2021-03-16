import { Inject, Injectable } from '@nestjs/common';

import * as path from 'path';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  FailedRequest,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { ModelValidation } from '@helpers/decorators';
import { jsonReader } from '@helpers/file-reader.helper';
import { jsonWriter } from '@helpers/file-writer.helper';

import { FILES_FOLDER } from '@core/core-module.config';
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
            const accessToken = this.tokenService.sign(user);

            return {
              successful: true,
              result: accessToken,
            } as SuccessfulRequest<string>;
          }

          return {
            successful: false,
            result: 'User was not found.',
          } as SuccessfulRequest<string>;
        }),
        catchError((err: FailedRequest) => {
          if (err.message === 'Error during file reading.') {
            return of({
              successful: false,
              result: 'User was not found.',
            } as SuccessfulRequest<string>);
          }

          return of(err);
        }),
      );
  }

  @ModelValidation<UserModel, User>(User)
  register(
    user: UserModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return jsonWriter.addObject<UserModel>(this.filePath, user).pipe(
      map((result: SuccessfulRequest<string>) => ({
        ...result,
        result: 'User was created.',
      })),
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during file reading.') {
          return jsonWriter.createJSON<UserModel>(this.filePath, user).pipe(
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
