import { Inject, Injectable } from '@nestjs/common';

import * as path from 'path';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  FailedRequest,
  ItemModel,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { ModelValidation } from '@helpers/decorators';
import { jsonReader } from '@helpers/file-reader.helper';
import {
  addItem,
  deleteItem,
  editItem,
  getAllItems,
  getItem,
} from '@helpers/items.helpers';

import { FILES_FOLDER } from '@core/core-module.config';

import { Course, CourseModel } from './courses.models';

@Injectable()
export class CoursesService {
  private readonly filePath = path.join(this.filesFolder, 'courses.json');

  constructor(@Inject(FILES_FOLDER) private filesFolder: string) {}

  getAllCourses(): Observable<
    SuccessfulRequest<ItemModel[] | string> | FailedRequest
  > {
    return getAllItems(this.filePath);
  }

  getCourse(
    id: string,
  ): Observable<SuccessfulRequest<ItemModel | string> | FailedRequest> {
    return getItem(id, this.filePath);
  }

  filterCourses(
    queries: QueryParams,
  ): Observable<SuccessfulRequest<CourseModel[] | string> | FailedRequest> {
    return jsonReader
      .getAllObjectsByQueries<CourseModel>(this.filePath, queries)
      .pipe(
        catchError((err: FailedRequest) => {
          if (err.message === 'Error during file reading.') {
            return of({
              successful: true,
              result: [],
            } as SuccessfulRequest<CourseModel[]>);
          }

          return of(err);
        }),
      );
  }

  @ModelValidation<CourseModel, Course>(Course)
  addCourse(course: CourseModel) {
    const courseWithCreationDate = {
      ...course,
      creationDate: new Date().toLocaleDateString('en-GB'),
    };
    return addItem(courseWithCreationDate, this.filePath);
  }

  @ModelValidation<CourseModel, Course>(Course, {
    titleRequired: false,
    descriptionRequired: false,
    durationRequired: false,
    authorsRequired: false,
  })
  editCourse(
    course: CourseModel,
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return editItem(course, id, this.filePath);
  }

  deleteCourse(
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return deleteItem(id, this.filePath);
  }
}
