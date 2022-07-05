export class AppError extends Error {
  status;

  constructor(status: number, message: string) {
    super(message);

    this.status = status;
  }

  static NotFound(message: string) {
    return new AppError(404, message);
  }

  static InternalError(message: string) {
    return new AppError(500, message);
  }
}
