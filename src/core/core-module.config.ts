export interface CoreModuleConfig {
  algorithm: string;
  timeLiving: number; // in seconds
  filesFolder: string;
}

export const TOKEN_CONFIG = 'token_config';

export const FILES_FOLDER = 'files_folder';

export const METADATA_AUTHORIZED_KEY = 'authorized';
