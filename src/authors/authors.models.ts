import { ValueWithRequiredState } from '@models/common.models';

import { getValidityStateOfModel, isString } from '@helpers/common.helpers';

export class Author implements AuthorModelWithRequiredState {
  name: ValueWithRequiredState<string>;

  constructor({ name = null }: AuthorModel) {
    this.name = {
      value: name,
      required: true,
      isValid: (name: string) => name && isString(name),
      type: 'string',
    };
  }

  get errorStates(): Promise<string[]> {
    return getValidityStateOfModel(this);
  }
}

interface AuthorModelWithRequiredState {
  name: ValueWithRequiredState<string>;
}

export interface AuthorModel {
  name: string;
  id: string;
}
