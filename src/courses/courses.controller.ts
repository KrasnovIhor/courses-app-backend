import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import {
  FailedRequest,
  ItemModel,
  QueryParams,
  SuccessfulRequest,
} from '@models/common.models';

import { Authorized, Roles } from '@helpers/decorators';

import { AuthorizationGuard } from '@core/authorization.guard';
import { METADATA_AUTHORIZED_KEY, UserRoles } from '@core/core-module.config';
import { RoleGuard } from '@core/role.guard';
import { SwaggerCourse } from '@swagger/models';

import { CourseModel } from './courses.models';
import { CoursesService } from './courses.service';

@Controller('courses')
@ApiTags('Courses')
@UseGuards(AuthorizationGuard, RoleGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('all')
  getAllCourses(): Observable<
    SuccessfulRequest<ItemModel[] | string> | FailedRequest
  > {
    return this.coursesService.getAllCourses();
  }

  @Get('filter')
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    isArray: true,
    explode: false,
  })
  @ApiQuery({
    name: 'description',
    required: false,
    type: String,
    isArray: true,
    explode: false,
  })
  @ApiQuery({
    name: 'creationDate',
    required: false,
    type: String,
    isArray: true,
    explode: false,
  })
  @ApiQuery({
    name: 'creationDate',
    required: false,
    type: String,
    isArray: true,
    explode: false,
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    type: String,
    isArray: true,
    explode: false,
  })
  getFilteredCourses(
    @Query() queries: QueryParams = {},
  ): Observable<SuccessfulRequest<CourseModel[] | string> | FailedRequest> {
    return this.coursesService.filterCourses(queries);
  }

  @Post('add')
  @ApiBody({
    type: SwaggerCourse,
  })
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  @Roles(UserRoles.admin)
  addCourse(
    @Body() body: CourseModel,
  ): Observable<SuccessfulRequest<string | ItemModel> | FailedRequest> {
    return this.coursesService.addCourse(body);
  }

  @Get(':id')
  getSingelCourse(
    @Param('id') id: string,
  ): Observable<SuccessfulRequest<ItemModel | string> | FailedRequest> {
    return this.coursesService.getCourse(id);
  }

  @Put(':id')
  @ApiBody({
    type: SwaggerCourse,
  })
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  @Roles(UserRoles.admin)
  editCourse(
    @Param('id') id: string,
    @Body() body: CourseModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.coursesService.editCourse(body, id);
  }

  @Delete(':id')
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  @Roles(UserRoles.admin)
  deleteCourse(
    @Param('id') id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.coursesService.deleteCourse(id);
  }
}
