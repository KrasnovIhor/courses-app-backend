import { HttpException, HttpStatus } from '@nestjs/common';

import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  FailedRequest,
  ItemModel,
  SuccessfulRequest,
} from '@models/common.models';

import { jsonReader } from './file-reader.helper';
import { jsonWriter } from './file-writer.helper';

export function getAllItems(
  filePath: string,
): Observable<SuccessfulRequest<ItemModel[] | string> | FailedRequest> {
  return jsonReader.getWholeJson<ItemModel>(filePath).pipe(
    catchError((err: FailedRequest) => {
      if (err.message === 'Error during file reading.') {
        return of({
          successful: true,
          result: [],
        } as SuccessfulRequest<ItemModel[] | string>);
      }

      return of(err);
    }),
  );
}

export function getItem(
  id: string,
  filePath: string,
): Observable<SuccessfulRequest<ItemModel | string> | FailedRequest> {
  return jsonReader
    .getSingleObject<ItemModel>(filePath, { id })
    .pipe(
      tap(({ result }: SuccessfulRequest<ItemModel | string>) => {
        if (!result) {
          throw new HttpException(
            { successful: false, result: `Item with id - ${id} was not found` },
            HttpStatus.NOT_FOUND,
          );
        }
      }),
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during file reading.') {
          throw new HttpException(
            { successful: false, result: `Item with id - ${id} was not found` },
            HttpStatus.NOT_FOUND,
          );
        }

        return throwError(err);
      }),
    );
}

export function addItem(
  item: ItemModel,
  filePath: string,
): Observable<SuccessfulRequest<string | ItemModel> | FailedRequest> {
  return jsonWriter.addObject<ItemModel>(filePath, item).pipe(
    catchError((err: FailedRequest) => {
      if (err.message === 'Error during file reading.') {
        return jsonWriter
          .createJSON<ItemModel>(filePath, item)
          .pipe(catchError((err: FailedRequest) => of(err)));
      }

      return of(err);
    }),
  );
}

export function editItem(
  item: ItemModel,
  id: string,
  filePath: string,
): Observable<SuccessfulRequest<string> | FailedRequest> {
  return jsonWriter.editObject<ItemModel>(filePath, item, id).pipe(
    catchError((err: FailedRequest) => {
      if (err.message === 'Error during renaming.') {
        throw new HttpException(
          { successful: false, result: `Item with id - ${id} was not found` },
          HttpStatus.NOT_FOUND,
        );
      }

      return of(err);
    }),
  );
}

export function deleteItem(
  id: string,
  filePath: string,
): Observable<SuccessfulRequest<string> | FailedRequest> {
  return jsonWriter.deleteObject<ItemModel>(filePath, id).pipe(
    catchError((err: FailedRequest) => {
      if (err.message === 'Error during renaming.') {
        throw new HttpException(
          { successful: false, result: `Item with id - ${id} was not found` },
          HttpStatus.NOT_FOUND,
        );
      }

      return of(err);
    }),
  );
}

export function areAllItemsExist(
  ids: string[],
  filePath: string,
  property: string,
  reverse = false,
): Promise<boolean> {
  return jsonReader
    .areAllItemsExistByProperty(ids, filePath, property)
    .toPromise()
    .then((allItemsExist: boolean) => {
      return reverse ? !allItemsExist : allItemsExist;
    });
}
