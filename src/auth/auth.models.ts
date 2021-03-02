import { ValueWithRequiredState } from '@models/common.models';

import { getValidityStateOfModel, isString } from '@helpers/common.helpers';

export interface UserModel {
  name: string;
  email: string;
  password: string;
}

export class User implements UserModelWithRequiredState {
  name: ValueWithRequiredState<string>;
  email: ValueWithRequiredState<string>;
  password: ValueWithRequiredState<string>;

  constructor({ name = null, email = null, password = null }: UserModel) {
    this.name = {
      value: name,
      required: false,
      isValid: name && isString(name),
      type: 'string',
    };
    this.email = {
      value: email,
      required: true,
      isValid: email && isString(email),
      type: 'string',
    };
    this.password = {
      value: password,
      required: true,
      isValid: password && isString(password),
      type: 'string',
    };
  }

  get errorStates(): string[] {
    return getValidityStateOfModel(this);
  }
}

interface UserModelWithRequiredState {
  name: ValueWithRequiredState<string>;
  email: ValueWithRequiredState<string>;
  password: ValueWithRequiredState<string>;
}
