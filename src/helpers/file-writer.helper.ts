import * as fs from 'fs';
import { Observable, of, Subscriber } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { v4 } from 'uuid';

import { FailedRequest, SuccessfulRequest } from '@models/common.models';
import { ObjectInfo, Position } from '@models/file-processing.models';

import { jsonReader } from './file-reader.helper';

class JsonWriter {
  addObject<T>(
    path: string,
    data: T,
  ): Observable<SuccessfulRequest<string | T> | FailedRequest> {
    const dataWithIDs = {
      ...data,
      id: v4(),
    };

    return jsonReader.getLastCharacterPosition(path).pipe(
      switchMap((result: Position) =>
        this._addObject<T>(path, dataWithIDs, result),
      ),
      map((result: SuccessfulRequest<string>) => {
        return result.successful
          ? ({ successful: true, result: dataWithIDs } as SuccessfulRequest<T>)
          : result;
      }),
    );
  }

  deleteObject<T extends { id: string }>(
    path: string,
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    const tempFilePath = `${v4()}-temp.json`;
    let writer: fs.WriteStream;
    let objectFound = 0;
    let count = 0;
    let isFirstIndex = true;

    return this.renameFile(path, tempFilePath).pipe(
      tap(() => (writer = fs.createWriteStream(path, { flags: 'a+' }))),
      switchMap(() =>
        jsonReader.getObjectByObject<T>(tempFilePath).pipe(
          tap(({ parsedJsonObject, finished }: ObjectInfo<T>) => {
            if (!finished) {
              count++;
            }

            if (parsedJsonObject && parsedJsonObject.id === id) {
              objectFound++;
            }
          }),
          filter(
            ({ parsedJsonObject, finished }: ObjectInfo<T>) =>
              finished || parsedJsonObject.id !== id,
          ),
          map((objectInfo: ObjectInfo<T>) => {
            if (isFirstIndex) {
              isFirstIndex = false;

              return {
                ...objectInfo,
                isFirstIndex: true,
              };
            }

            return {
              ...objectInfo,
              isFirstIndex,
            };
          }),
        ),
      ),
      tap((objectInfo: ObjectInfo<T>) => this.writeToFile(objectInfo, writer)),
      filter(({ finished }: ObjectInfo<T>) => finished),
      tap(() => writer.end()),
      switchMap(() => this.deleteFile(tempFilePath)),
      switchMap(() =>
        count - objectFound === 0 ? this.deleteFile(path) : of(null),
      ),
      map(
        () =>
          ({
            successful: objectFound > 0,
            result:
              objectFound > 0
                ? `Object with id - ${id} was deleted.`
                : `Object with id - ${id} was not found.`,
          } as SuccessfulRequest<string>),
      ),
    );
  }

  editObject<T extends { id: string }>(
    path: string,
    data: T,
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    const tempFilePath = `${v4()}-temp.json`;
    let writer: fs.WriteStream;
    let objectFound = null;

    return this.renameFile(path, tempFilePath).pipe(
      tap(() => (writer = fs.createWriteStream(path, { flags: 'a+' }))),
      switchMap(() => jsonReader.getObjectByObject<T>(tempFilePath)),
      map(({ isFirstIndex, finished, parsedJsonObject }: ObjectInfo<T>) => {
        if (finished) {
          return {
            finished,
          };
        }

        return {
          parsedJsonObject: this._editObject<T>(parsedJsonObject, data, id),
          finished,
          isFirstIndex,
        };
      }),
      tap((objectInfo: ObjectInfo<T>) => this.writeToFile(objectInfo, writer)),
      tap(({ parsedJsonObject }: ObjectInfo<T>) => {
        if (!objectFound && parsedJsonObject && parsedJsonObject.id === id) {
          objectFound = parsedJsonObject;
        }
      }),
      filter(({ finished }: ObjectInfo<T>) => finished),
      tap(() => writer.end()),
      switchMap(() => this.deleteFile(tempFilePath)),
      map(
        () =>
          ({
            successful: !!objectFound,
            result: objectFound
              ? objectFound
              : `Object with id - ${id} was not found.`,
          } as SuccessfulRequest<string>),
      ),
    );
  }

  private writeToFile<T>(
    { isFirstIndex, finished, parsedJsonObject }: ObjectInfo<T>,
    writer: fs.WriteStream,
  ): void {
    const stringToWrite = finished
      ? ']'
      : `${isFirstIndex ? '[' : ','}${JSON.stringify(parsedJsonObject)}`;

    writer.write(stringToWrite);
  }

  private deleteFile(path: string): Observable<void | FailedRequest> {
    return new Observable((subscriber: Subscriber<void>) => {
      fs.unlink(path, (err: any) => {
        if (err) {
          subscriber.error({
            successful: false,
            message: 'Error during deletion.',
          });
        } else {
          subscriber.next();
        }

        subscriber.complete();
      });
    });
  }

  private renameFile(
    path: string,
    tempPath: string,
  ): Observable<void | FailedRequest> {
    return new Observable((subscriber: Subscriber<void>) => {
      fs.rename(path, tempPath, (err: any) => {
        if (err) {
          subscriber.error({
            successful: false,
            message: 'Error during renaming.',
          });
        } else {
          subscriber.next();
        }

        subscriber.complete();
      });
    });
  }

  private _editObject<T extends { id: string }>(
    parsedJsonObject: T,
    data: T,
    id: string,
  ): T {
    if (parsedJsonObject.id !== id) {
      return parsedJsonObject;
    }

    return {
      ...parsedJsonObject,
      ...data,
    };
  }

  private _addObject<T>(
    path: string,
    data: T | T[],
    { successful, position }: Position,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return new Observable(
      (subscriber: Subscriber<SuccessfulRequest<string> | FailedRequest>) => {
        const writer = fs.createWriteStream(path, {
          flags: 'r+',
          start: position ?? 0,
        });
        const dataAsStringifyArray = `${successful ? ',' : '['}${JSON.stringify(
          data,
        )}]`;

        writer.on('close', () => {
          subscriber.next({
            successful: true,
            result: 'Object was added.',
          });
          subscriber.complete();
        });

        writer.on('error', () => {
          subscriber.next({
            successful: false,
            result: 'Error during file opening.',
          });
          subscriber.complete();
        });

        writer.once('open', () => {
          writer.write(dataAsStringifyArray, () => {
            writer.end();
          });
        });
      },
    );
  }

  createJSON<T>(
    path: string,
    data: T,
  ): Observable<SuccessfulRequest<string | T> | FailedRequest> {
    const dataWithId = {
      ...data,
      id: v4(),
    };

    return new Observable(
      (
        subscriber: Subscriber<SuccessfulRequest<string | T> | FailedRequest>,
      ) => {
        const writer = fs.createWriteStream(path, { flags: 'w' });
        const dataAsStringifyArray = `[${JSON.stringify(dataWithId)}]`;

        writer.on('close', () => {
          subscriber.next({
            successful: true,
            result: dataWithId,
          });
          subscriber.complete();
        });

        writer.on('error', () => {
          subscriber.next({
            successful: false,
            result: 'Error during file opening.',
          });
          subscriber.complete();
        });

        writer.once('open', () => {
          writer.write(dataAsStringifyArray, () => {
            writer.end();
          });
        });
      },
    );
  }
}

export const jsonWriter = new JsonWriter();
