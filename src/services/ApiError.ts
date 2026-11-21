export class ApiError extends Error {
  constructor(
    message: string,
    public code: 'FORBIDDEN' | 'CONFLICT' | 'VALIDATION' | 'UNAVAILABLE' | 'NOT_FOUND',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
