import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import * as path from 'path';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  FailedRequest,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { jsonReader } from '@helpers/file-reader.helper';
import { jsonWriter } from '@helpers/file-writer.helper';

import { Course, CourseModel, ValueWithRequiredState } from './courses.models';

@Injectable()
export class CoursesService {
  private readonly filePath = path.join(__dirname, 'courses.json');

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

  addCourse(
    data: CourseModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    const course = new Course(data);
    const errors = course.errorStates;

    if (errors.length) {
      throw new HttpException(
        { successful: false, errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    return jsonWriter
      .addObject<CourseModel>(this.filePath, this.getValuesFromCourse(course))
      .pipe(
        catchError((err: FailedRequest) => {
          if (err.message === 'Error during file reading.') {
            return jsonWriter.createJSON<CourseModel>(
              this.filePath,
              this.getValuesFromCourse(course),
            );
          }

          return of(err);
        }),
      );
  }

  editCourse(
    id: string,
    newData: CourseModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    const updatedCourse = new Course(newData);
    const errors = updatedCourse.errorStates;

    if (errors.length) {
      throw new HttpException(
        { successful: false, errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    return jsonWriter
      .editObject<CourseModel>(
        this.filePath,
        this.getValuesFromCourse(updatedCourse),
        id,
      )
      .pipe(
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

  private getValuesFromCourse(course: Course): CourseModel {
    return Object.entries(course).reduce(
      (
        acc: CourseModel,
        [key, { value }]: [string, ValueWithRequiredState<any>],
      ) => {
        return {
          ...acc,
          [key]: value,
        };
      },
      {} as CourseModel,
    );
  }
}
