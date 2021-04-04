import { Module } from '@nestjs/common';

import { bdMainPath } from '@helpers/common.helpers';

import { CoreModule } from '@core/core.module';

import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { CoursesModule } from './courses/courses.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CoreModule.forRoot({
      algorithm: 'sha256',
      timeLiving: 3600 * 24, // one day
      filesFolder: bdMainPath,
    }),
    AuthModule,
    CoursesModule,
    AuthorsModule,
    UsersModule,
  ],
})
export class AppModule {}
