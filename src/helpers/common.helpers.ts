import * as path from 'path';

import { ValueWithRequiredState } from '@models/common.models';

export const bdMainPath = path.join(__dirname, '..', '..', '..', 'bd');

export function isString(value: any): boolean {
  return typeof value === 'string';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

export function getValuesFromModel<T, P>(model: T): P {
  return Object.entries(model).reduce(
    (acc: P, [key, { value }]: [string, ValueWithRequiredState<any>]) => {
      if (!value) {
        return acc;
      }

      return {
        ...acc,
        [key]: value,
      };
    },
    {} as P,
  );
}

export async function getValidityStateOfModel<T>(self: T): Promise<string[]> {
  const promises = Object.keys(self).map((key: string) =>
    Promise.resolve(key)
      .then((key: string) => {
        const classProperty = self[key] as ValueWithRequiredState<any>;

        if (classProperty.required && !classProperty.value) {
          return `'${key}' was missed.`;
        }

        return (
          classProperty.value && classProperty.isValid(classProperty.value)
        );
      })
      .then((result: boolean | string) => {
        if (typeof result !== 'boolean') {
          return result;
        }

        const classProperty = self[key] as ValueWithRequiredState<any>;

        return result ? null : `'${key}' should be a ${classProperty.type}`;
      }),
  );

  return Promise.all(promises).then((keys: string[]) => {
    return keys.filter(Boolean);
  });
}
