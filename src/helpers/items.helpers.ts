import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during file reading.') {
          return of({
            successful: true,
            result: `Item with id - ${id} was not found`,
          } as SuccessfulRequest<string>);
        }

        return of(err);
      }),
    );
}

export function addItem(
  item: ItemModel,
  filePath: string,
): Observable<SuccessfulRequest<string> | FailedRequest> {
  return jsonWriter.addObject<ItemModel>(filePath, item).pipe(
    map((result: SuccessfulRequest<string>) => ({
      ...result,
      result: `Item was added.`,
    })),
    catchError((err: FailedRequest) => {
      if (err.message === 'Error during file reading.') {
        return jsonWriter.createJSON<ItemModel>(filePath, item).pipe(
          map((result: SuccessfulRequest<string>) => ({
            ...result,
            result: 'Item was added.',
          })),
          catchError((err: FailedRequest) => of(err)),
        );
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
        return of({
          successful: true,
          result: `Item with id - ${id} was not found.`,
        } as SuccessfulRequest<string>);
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
        return of({
          successful: true,
          result: `Item with id - ${id} was not found.`,
        } as SuccessfulRequest<string>);
      }

      return of(err);
    }),
  );
}
