import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import {
  FailedRequest,
  ItemModel,
  SuccessfulRequest,
} from '@models/common.models';

import { Authorized } from '@helpers/decorators';

import { AuthorizationGuard } from '@core/authorization.guard';
import { METADATA_AUTHORIZED_KEY } from '@core/core-module.config';
import { SwaggerAuthor } from '@swagger/models';

import { AuthorModel } from './authors.models';
import { AuthorsService } from './authors.service';

@Controller('authors')
@ApiTags('Authors')
@UseGuards(AuthorizationGuard)
export class AuthorsController {
  constructor(private authorsService: AuthorsService) {}

  @Get('all')
  getAllAuthors(): Observable<
    SuccessfulRequest<ItemModel[] | string> | FailedRequest
  > {
    return this.authorsService.getAllAuthors();
  }

  @Post('add')
  @ApiBody({
    type: SwaggerAuthor,
  })
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  addAuthor(
    @Body() body: AuthorModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authorsService.addAuthor(body);
  }

  @Get(':id')
  getSingleAuthor(
    @Param('id') id: string,
  ): Observable<SuccessfulRequest<ItemModel | string> | FailedRequest> {
    return this.authorsService.getAuthor(id);
  }

  @Put(':id')
  @ApiBody({
    type: SwaggerAuthor,
  })
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  editAuthor(
    @Param('id') id: string,
    @Body() body: AuthorModel,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authorsService.editAuthor(body, id);
  }

  @Delete(':id')
  @ApiBasicAuth(METADATA_AUTHORIZED_KEY)
  @Authorized()
  deleteAuthor(
    @Param('id') id: string,
  ): Observable<SuccessfulRequest<string> | FailedRequest> {
    return this.authorsService.deleteAuthor(id);
  }
}
