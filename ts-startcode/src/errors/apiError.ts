class ApiError extends Error {
  constructor(msg: string, public errorCode?: number) {
    super(msg);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = "ApiError";
    this.errorCode = errorCode || 500;
  }
}

export { ApiError };
