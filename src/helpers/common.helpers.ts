import { ValueWithRequiredState } from '@models/common.models';

export function isString(value: any): boolean {
  return typeof value === 'string';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

export function isArrayContainsOnlyString(array: any[]): boolean {
  return array.every(isString);
}

export function getValuesFromModel<T, P>(model: T): P {
  return Object.entries(model).reduce(
    (acc: P, [key, { value }]: [string, ValueWithRequiredState<any>]) => {
      return {
        ...acc,
        [key]: value,
      };
    },
    {} as P,
  );
}

export function getValidityStateOfModel<T>(self: T): string[] {
  return Object.keys(self).reduce((acc: string[], key: string) => {
    const classProperty = self[key] as ValueWithRequiredState<any>;

    if (classProperty.required && !classProperty.value) {
      return [...acc, `'${key}' was missed.`];
    }

    if (classProperty.value && !classProperty.isValid) {
      return [...acc, `'${key}' should be a ${classProperty.type}`];
    }

    return acc;
  }, [] as string[]);
}
