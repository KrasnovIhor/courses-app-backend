import * as path from 'path';

import { ValueWithRequiredState } from '@models/common.models';

import {
  bdMainPath,
  getValidityStateOfModel,
  isString,
} from '@helpers/common.helpers';
import { areAllItemsExist } from '@helpers/items.helpers';

export interface UserModel {
  name: string;
  email: string;
  password: string;
  role: string;
}

export class User implements UserModelWithRequiredState {
  name: ValueWithRequiredState<string>;
  email: ValueWithRequiredState<string>;
  password: ValueWithRequiredState<string>;
  filePath: string = path.join(bdMainPath, 'users.json');

  constructor(
    { name = null, email = null, password = null }: UserModel,
    {
      nameRequired = false,
      emailRequired = true,
      passwordRequired = true,
    }: { [key: string]: boolean } = {},
  ) {
    this.name = {
      value: name,
      required: nameRequired,
      isValid: (name: string) => name && isString(name),
      type: 'string',
    };
    this.email = {
      value: email,
      required: emailRequired,
      isValid: (email: string) =>
        email &&
        isString(email) &&
        /.+@[^@]+\.[^@]{2,}$/.test(email) &&
        (nameRequired
          ? areAllItemsExist([email], this.filePath, 'email', true)
          : true),
      type: `string and it should be an email${
        nameRequired ? ' or email already exists' : ''
      }`,
    };
    this.password = {
      value: password,
      required: passwordRequired,
      isValid: (password: string) =>
        password &&
        isString(password) &&
        (nameRequired ? password.length >= 6 : true),
      type: `string${
        nameRequired ? ' and length should be 6 characters minimum' : ''
      }`,
    };
  }

  get errorStates(): Promise<string[]> {
    return getValidityStateOfModel(this);
  }
}

interface UserModelWithRequiredState {
  name: ValueWithRequiredState<string>;
  email: ValueWithRequiredState<string>;
  password: ValueWithRequiredState<string>;
}
