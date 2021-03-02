export interface TokenVerificationResult<T> {
  error: VerificationError | null;
  user: T;
}

interface VerificationError {
  message: string;
}
