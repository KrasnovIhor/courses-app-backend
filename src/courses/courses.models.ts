import { ValueWithRequiredState } from '@models/common.models';

import {
  getValidityStateOfModel,
  isArrayContainsOnlyString,
  isNumber,
  isString,
} from '@helpers/common.helpers';

export class Course implements CourseModelWithRequiredState {
  title: ValueWithRequiredState<string>;
  description: ValueWithRequiredState<string>;
  duration: ValueWithRequiredState<number>;
  authors: ValueWithRequiredState<string[]>;

  constructor({
    title = null,
    description = null,
    duration = null,
    authors = null,
  }: CourseModel) {
    this.title = {
      value: title,
      required: true,
      isValid: title && isString(title),
      type: 'string',
    };
    this.description = {
      value: description,
      required: true,
      isValid: description && isString(description),
      type: 'string',
    };
    this.duration = {
      value: duration,
      required: true,
      isValid: duration && isNumber(duration),
      type: 'number',
    };
    this.authors = {
      value: authors,
      required: true,
      isValid: authors && authors.length && isArrayContainsOnlyString(authors),
      type: 'string[]',
    };
  }

  get errorStates(): string[] {
    return getValidityStateOfModel(this);
  }
}

interface CourseModelWithRequiredState {
  title: ValueWithRequiredState<string>;
  description: ValueWithRequiredState<string>;
  duration: ValueWithRequiredState<number>;
  authors: ValueWithRequiredState<string[]>;
}

export interface CourseModel {
  title: string;
  description: string;
  creationDate: string;
  duration: number;
  authors: string[];
  id: string;
}
