import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  FailedRequest,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { CourseModel } from './courses.models';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('all')
  getAllCourses(): Observable<
    SuccessfulRequest<CourseModel[] | string> | FailedRequest
  > {
    return this.coursesService.getAllCourses();
  }

  @Get('filter')
  getFilteredCourses(
    @Query() queries: QueryParams = {},
  ): Observable<SuccessfulRequest<CourseModel[] | string> | FailedRequest> {
    return this.coursesService.filterCourses(queries);
  }

  @Post('add')
  addCourse(
    @Body() body: CourseModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.coursesService.addCourse(body);
  }

  @Get(':id')
  getSingelCourse(
    @Param('id') id: string,
  ): Observable<SuccessfulRequest<CourseModel | string> | FailedRequest> {
    return this.coursesService.getCourse(id);
  }

  @Put(':id')
  editCourse(
    @Param('id') id: string,
    @Body() body: CourseModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.coursesService.editCourse(id, body);
  }

  @Delete(':id')
  deleteCourse(
    @Param('id') id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.coursesService.deleteCourse(id);
  }
}
