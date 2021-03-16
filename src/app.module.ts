import { Module } from '@nestjs/common';

import * as path from 'path';

import { CoreModule } from '@core/core.module';

import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    CoreModule.forRoot({
      algorithm: 'sha256',
      timeLiving: 600,
      filesFolder: path.join(__dirname, '..', '..', 'bd'),
    }),
    AuthModule,
    CoursesModule,
  ],
})
export class AppModule {}
