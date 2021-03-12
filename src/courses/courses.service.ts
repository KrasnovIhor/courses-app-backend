import { Inject, Injectable } from '@nestjs/common';

import * as path from 'path';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  FailedRequest,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { ModelValidation } from '@helpers/decorators';
import { jsonReader } from '@helpers/file-reader.helper';
import { jsonWriter } from '@helpers/file-writer.helper';

import { FILES_FOLDER } from '@core/core-module.config';

import { Course, CourseModel } from './courses.models';

@Injectable()
export class CoursesService {
  private readonly filePath = path.join(this.filesFolder, 'courses.json');

  constructor(@Inject(FILES_FOLDER) private filesFolder: string) {}

  getAllCourses(): Observable<
    SuccessfulRequest<CourseModel[] | string> | FailedRequest
  > {
    return jsonReader.getWholeJson<CourseModel>(this.filePath).pipe(
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

  getCourse(
    id: string,
  ): Observable<SuccessfulRequest<CourseModel | string> | FailedRequest> {
    return jsonReader
      .getSingleObject<CourseModel>(this.filePath, { id })
      .pipe(
        catchError((err: FailedRequest) => {
          if (err.message === 'Error during file reading.') {
            return of({
              successful: true,
              result: `Course with id - ${id} was not found`,
            } as SuccessfulRequest<string>);
          }

          return of(err);
        }),
      );
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
  addCourse(
    course: CourseModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return jsonWriter.addObject<CourseModel>(this.filePath, course).pipe(
      map((result: SuccessfulRequest<string>) => ({
        ...result,
        result: 'Course was added.',
      })),
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during file reading.') {
          return jsonWriter.createJSON<CourseModel>(this.filePath, course).pipe(
            map((result: SuccessfulRequest<string>) => ({
              ...result,
              result: 'Course was added.',
            })),
            catchError((err: FailedRequest) => of(err)),
          );
        }

        return of(err);
      }),
    );
  }

  @ModelValidation<CourseModel, Course>(Course)
  editCourse(
    course: CourseModel,
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return jsonWriter.editObject<CourseModel>(this.filePath, course, id).pipe(
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during renaming.') {
          return of({
            successful: true,
            result: `Course with id - ${id} was not found.`,
          } as SuccessfulRequest<string>);
        }

        return of(err);
      }),
    );
  }

  deleteCourse(
    id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return jsonWriter.deleteObject<CourseModel>(this.filePath, id).pipe(
      catchError((err: FailedRequest) => {
        if (err.message === 'Error during renaming.') {
          return of({
            successful: true,
            result: `Course with id - ${id} was not found.`,
          } as SuccessfulRequest<string>);
        }

        return of(err);
      }),
    );
  }
}
