import * as fs from 'fs';
import { Observable, Subscriber } from 'rxjs';

import {
  FailedRequest,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';
import { ObjectInfo, Position } from '@models/file-processing.models';

class JsonReader {
  getWholeJson<T>(
    path: string,
  ): Observable<SuccessfulRequest<T[] | string> | FailedRequest> {
    return new Observable(
      (
        subscriber: Subscriber<SuccessfulRequest<T[] | string> | FailedRequest>,
      ) => {
        const reader = fs.createReadStream(path, {
          encoding: 'utf8',
        });
        let chunks = '';

        reader.on('data', (chunk: string) => {
          chunks += chunk;
        });

        reader.on('close', () => {
          subscriber.next({
            successful: true,
            result: JSON.parse(chunks),
          });
          subscriber.complete();
        });

        reader.on('error', () => {
          subscriber.error({
            successful: false,
            message: 'Error during file reading.',
          });
          subscriber.complete();
        });
      },
    );
  }

  areAllItemsExistByProperty(
    items: string[],
    path: string,
    property: string,
  ): Observable<boolean> {
    return new Observable((subscriber: Subscriber<boolean>) => {
      const reader = fs.createReadStream(path, {
        encoding: 'utf8',
      });

      reader.on('readable', function () {
        let chunks = '';
        let chunk: string;
        let openedBraces = 0;
        const foundItems = [];
        let allExist = false;

        while (null !== (chunk = reader.read(1))) {
          if (chunk === '{') {
            openedBraces++;
          }

          if (!chunks && openedBraces === 0) {
            continue;
          }

          if (chunk === '}') {
            openedBraces--;
          }

          chunks += chunk;

          if (openedBraces !== 0) {
            continue;
          }

          const parsedJsonObject = JSON.parse(chunks);
          const item = items.find(
            (item: string) => parsedJsonObject[property] === item,
          );

          chunks = '';

          if (item) {
            foundItems.push(item);
          }

          if (foundItems.length === items.length) {
            allExist = true;

            break;
          }
        }

        subscriber.next(allExist);
        subscriber.complete();
      });

      reader.on('error', () => {
        subscriber.next(false);
        subscriber.complete();
      });
    });
  }

  getObjectByObject<T>(
    path: string,
  ): Observable<ObjectInfo<T> | FailedRequest> {
    return new Observable(
      (subscriber: Subscriber<ObjectInfo<T> | FailedRequest>) => {
        const reader = fs.createReadStream(path, {
          encoding: 'utf8',
        });

        reader.on('readable', function () {
          let chunks = '';
          let chunk: string;
          let openedBraces = 0;
          let finished = false;
          let isFirstIndex = true;

          while (null !== (chunk = reader.read(1))) {
            if (chunk === '{') {
              openedBraces++;
            }

            if (!chunks && openedBraces === 0) {
              continue;
            }

            if (chunk === '}') {
              openedBraces--;
            }

            chunks += chunk;

            if (openedBraces !== 0) {
              continue;
            }

            const parsedJsonObject = JSON.parse(chunks);

            subscriber.next({ finished, parsedJsonObject, isFirstIndex });

            chunks = '';
            isFirstIndex = false;
          }

          finished = true;
          subscriber.next({ finished });
          subscriber.complete();
        });

        reader.on('error', () => {
          subscriber.error({
            successful: false,
            message: 'Error during file reading.',
          });
          subscriber.complete();
        });
      },
    );
  }

  getSingleObject<T>(
    path: string,
    queries: QueryParams,
  ): Observable<SuccessfulRequest<T | string> | FailedRequest> {
    return new Observable(
      (subscriber: Subscriber<SuccessfulRequest<T | string>>) => {
        const reader = fs.createReadStream(path, {
          encoding: 'utf8',
        });

        reader.on('readable', function () {
          let chunks = '';
          let chunk: string;
          let openedBraces = 0;
          let parsedJsonObject: T;
          const keys = Object.keys(queries);

          while (null !== (chunk = reader.read(1))) {
            if (chunk === '{') {
              openedBraces++;
            }

            if (!chunks && openedBraces === 0) {
              continue;
            }

            if (chunk === '}') {
              openedBraces--;
            }

            chunks += chunk;

            if (openedBraces !== 0) {
              continue;
            }

            parsedJsonObject = JSON.parse(chunks);
            const isObjectNotFound = keys.some((key: string) => {
              return queries[key] !== parsedJsonObject[key];
            });

            if (isObjectNotFound) {
              chunks = '';
            } else {
              break;
            }
          }

          reader.close();
          subscriber.next({
            successful: true,
            result: chunks ? parsedJsonObject : null,
          });
          subscriber.complete();
        });

        reader.on('error', () => {
          subscriber.error({
            successful: false,
            message: 'Error during file reading.',
          });
          subscriber.complete();
        });
      },
    );
  }

  getAllObjectsByQueries<T>(
    path: string,
    queries: any,
  ): Observable<SuccessfulRequest<T[] | string> | FailedRequest> {
    return new Observable(
      (
        subscriber: Subscriber<SuccessfulRequest<T[] | string> | FailedRequest>,
      ) => {
        const reader = fs.createReadStream(path, {
          encoding: 'utf8',
        });
        const keys = Object.keys(queries);
        const queriesWithAdditionalInfo = keys.reduce(
          (acc: any, key: string) => {
            const [value, isStrictEquality] = (queries[key] as string).split(
              ',',
            );

            return {
              ...acc,
              [key]: {
                value: decodeURIComponent(value),
                isStrictEquality:
                  !isStrictEquality || isStrictEquality === 'true',
              },
            };
          },
          {},
        );

        reader.on('readable', function () {
          let chunks = '';
          let chunk: string;
          let openedBraces = 0;
          const foundObjects = [];

          while (null !== (chunk = reader.read(1))) {
            if (chunk === '{') {
              openedBraces++;
            }

            if (!chunks && openedBraces === 0) {
              continue;
            }

            if (chunk === '}') {
              openedBraces--;
            }

            chunks += chunk;

            if (openedBraces !== 0) {
              continue;
            }

            const parsedJsonObject = JSON.parse(chunks);
            const isObjectNotFound = keys.some((key: string) => {
              const { value, isStrictEquality } = queriesWithAdditionalInfo[
                key
              ];
              const jsonObjectValue = parsedJsonObject[key];

              if (isStrictEquality || typeof jsonObjectValue !== 'string') {
                return value != jsonObjectValue;
              }

              return !jsonObjectValue.includes(value);
            });

            if (!isObjectNotFound) {
              foundObjects.push(JSON.parse(chunks));
            }

            chunks = '';
          }

          reader.close();
          subscriber.next({
            successful: true,
            result: foundObjects,
          });
          subscriber.complete();
        });

        reader.on('error', () => {
          subscriber.error({
            successful: false,
            message: 'Error during file reading.',
          });
          subscriber.complete();
        });
      },
    );
  }

  getLastCharacterPosition(path: string): Observable<Position | FailedRequest> {
    return new Observable(
      (subscriber: Subscriber<Position | FailedRequest>) => {
        const reader = fs.createReadStream(path, {
          encoding: 'utf8',
        });

        reader.on('readable', function () {
          let position = 0;
          let letter: string;
          let previous: string;
          let countOfEmptyChars = 0;

          while (true) {
            if (letter) {
              previous = letter;
            }

            letter = reader.read(1);

            if (letter === null) {
              break;
            }

            if (letter === '\n' || letter === ' ') {
              countOfEmptyChars += Buffer.byteLength(letter, 'utf8');

              continue;
            }

            if ((previous === '\n' || previous === ' ') && letter) {
              position += countOfEmptyChars;
              countOfEmptyChars = 0;
            }

            position += Buffer.byteLength(letter, 'utf8');
          }

          reader.close();

          const lastCharcter = position - 1;

          subscriber.next({
            successful: true,
            position: lastCharcter > 0 ? lastCharcter : 0,
          });
          subscriber.complete();
        });

        reader.on('error', () => {
          subscriber.error({
            successful: false,
            message: 'Error during file reading.',
          });
          subscriber.complete();
        });
      },
    );
  }
}

export const jsonReader = new JsonReader();
