export interface ObjectInfo<T> {
  finished: boolean;
  parsedJsonObject?: T;
  isFirstIndex?: boolean;
}

export interface Position {
  successful: boolean;
  position: number;
}
