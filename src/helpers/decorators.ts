import {
  CustomDecorator,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';

import {
  METADATA_AUTHORIZED_KEY,
  METADATA_ROLE_KEY,
} from '@core/core-module.config';

import { getValuesFromModel } from './common.helpers';

export function Authorized(): CustomDecorator {
  return SetMetadata(METADATA_AUTHORIZED_KEY, true);
}

export function Roles(...roles: string[]): CustomDecorator {
  return SetMetadata(METADATA_ROLE_KEY, roles);
}

export function ModelValidation<
  T,
  P extends { errorStates: Promise<string[]> }
>(
  Model: {
    new (
      model: T,
      requiredFields: { [key: string]: boolean },
      filePath?: string,
    ): P;
  },
  requiredState?: { [key: string]: boolean },
): MethodDecorator {
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
    descriptor.value = async function (data: T, ...rest: any[]): Promise<any> {
      const validatedData = new Model(data, requiredState);
      const errors = await validatedData.errorStates;

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
