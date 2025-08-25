import { HttpException, HttpStatus } from "@nestjs/common";

export const TypeExceptions = {
  UserNotFound(): HttpException {
    return new HttpException(
      {
        message: "User not found",
        error: "Not Found",
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND
    );
  },

  UserAlreadyExists(): HttpException {
    return new HttpException(
      {
        message: "User already exists",
        error: "UserAlreadyExists",
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT
    );
  },

  NotFoundError(message: string): HttpException {
    return new HttpException(
      {
        message,
        error: "Not Found",
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND
    );
  },

  BadRequestError(message: string): HttpException {
    return new HttpException(
      {
        message,
        error: "Bad Request",
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST
    );
  },

  InvalidFile(): HttpException {
    return new HttpException(
      {
        message: "Uploaded file is invalid",
        error: "InvalidFile",
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST
    );
  },

  UnknownError(message: string): HttpException {
    return new HttpException(
      {
        message: message || "Something went wrong, please try again later!",
        error: "UnknownError",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  },
};
