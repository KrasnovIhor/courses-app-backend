import { Inject, Injectable } from '@nestjs/common';

import * as path from 'path';
import { Observable } from 'rxjs';

import {
  FailedRequest,
  ItemModel,
  SuccessfulRequest,
} from '@models/common.models';

import { ModelValidation } from '@helpers/decorators';
import {
  addItem,
  deleteItem,
  editItem,
  getAllItems,
  getItem,
} from '@helpers/items.helpers';

import { FILES_FOLDER } from '@core/core-module.config';

import { Author, AuthorModel } from './authors.models';

@Injectable()
export class AuthorsService {
  private readonly filePath = path.join(this.filesFolder, 'authors.json');

  constructor(@Inject(FILES_FOLDER) private filesFolder: string) {}

  getAllAuthors(): Observable<
    SuccessfulRequest<ItemModel[] | string> | FailedRequest
  > {
    return getAllItems(this.filePath);
  }

  getAuthor(
    id: string,
  ): Observable<SuccessfulRequest<ItemModel | string> | FailedRequest> {
    return getItem(id, this.filePath);
  }

  @ModelValidation<AuthorModel, Author>(Author)
  addAuthor(
    author: AuthorModel,
  ): Observable<SuccessfulRequest<string | ItemModel> | FailedRequest> {
    return addItem(author, this.filePath);
  }

  @ModelValidation<AuthorModel, Author>(Author)
  editAuthor(
    author: AuthorModel,
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return editItem(author, id, this.filePath);
  }

  deleteAuthor(
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return deleteItem(id, this.filePath);
  }
}
