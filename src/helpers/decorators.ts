import {
  CustomDecorator,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';

import { METADATA_AUTHORIZED_KEY } from '@core/core-module.config';

import { getValuesFromModel } from './common.helpers';

export function Authorized(): CustomDecorator {
  return SetMetadata(METADATA_AUTHORIZED_KEY, true);
}

export function ModelValidation<T, P extends { errorStates: string[] }>(Model: {
  new (model: T): P;
}): MethodDecorator {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void => {
    if (!descriptor) {
      descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }

    const originalMethod = descriptor.value;

    /**
     * The first argument of this function must be a model, that is going to be validated.
     */
    descriptor.value = function (data: T, ...rest: any[]): any {
      const validatedData = new Model(data);
      const errors = validatedData.errorStates;

      if (errors.length) {
        throw new HttpException(
          { successful: false, errors },
          HttpStatus.BAD_REQUEST,
        );
      }

      return originalMethod.call(
        this,
        getValuesFromModel<P, T>(validatedData),
        ...rest,
      );
    };
  };
}
