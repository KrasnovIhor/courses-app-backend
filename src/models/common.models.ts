export interface QueryParams {
  [key: string]: string;
}

export interface SuccessfulRequest<T> {
  successful: boolean;
  result: T;
}

export interface FailedRequest {
  successful: false;
  message?: string;
  errors?: string[];
}

export interface ValueWithRequiredState<T> {
  value: T;
  required: boolean;
  isValid: boolean;
  type: string;
}
