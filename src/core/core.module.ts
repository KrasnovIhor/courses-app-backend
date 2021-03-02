import { DynamicModule, Global, Module } from '@nestjs/common';

import {
  CoreModuleConfig,
  FILES_FOLDER,
  TOKEN_CONFIG,
} from './core-module.config';
import { TokenService } from './token.service';

@Global()
@Module({})
export class CoreModule {
  static forRoot({
    algorithm,
    timeLiving,
    filesFolder,
  }: CoreModuleConfig): DynamicModule {
    const filesFolderProvider = {
      provide: FILES_FOLDER,
      useValue: filesFolder,
    };

    return {
      module: CoreModule,
      providers: [
        TokenService,
        {
          provide: TOKEN_CONFIG,
          useValue: {
            algorithm,
            timeLiving: timeLiving * 1000, // convert to milliseconds
          },
        },
        filesFolderProvider,
      ],
      exports: [TokenService, filesFolderProvider],
    };
  }
}
