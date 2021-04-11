import * as path from 'path';

import { ValueWithRequiredState } from '@models/common.models';

import {
  bdMainPath,
  getValidityStateOfModel,
  isNumber,
  isString,
} from '@helpers/common.helpers';
import { areAllItemsExist } from '@helpers/items.helpers';

export class Course implements CourseModelWithRequiredState {
  title: ValueWithRequiredState<string>;
  description: ValueWithRequiredState<string>;
  duration: ValueWithRequiredState<number>;
  authors: ValueWithRequiredState<string[]>;
  filePath: string = path.join(bdMainPath, 'authors.json');

  constructor(
    {
      title = null,
      description = null,
      duration = null,
      authors = null,
    }: CourseModel,
    {
      titleRequired = true,
      descriptionRequired = true,
      durationRequired = true,
      authorsRequired = true,
    }: { [key: string]: boolean } = {},
  ) {
    this.title = {
      value: title,
      required: titleRequired,
      isValid: (title: string) => title && isString(title),
      type: 'string',
    };
    this.description = {
      value: description,
      required: descriptionRequired,
      isValid: (description: string) => description && isString(description),
      type: 'string',
    };
    this.duration = {
      value: duration,
      required: durationRequired,
      isValid: (duration: number) => duration && isNumber(duration),
      type: 'number',
    };
    this.authors = {
      value: authors,
      required: authorsRequired,
      isValid: (authors: string[]) =>
        authors &&
        authors.length &&
        areAllItemsExist(authors, this.filePath, 'id'),
      type: 'string[] and those strings must be actual IDs.',
    };
  }

  get errorStates(): Promise<string[]> {
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
