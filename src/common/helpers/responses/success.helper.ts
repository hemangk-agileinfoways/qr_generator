import { HttpStatus } from "@nestjs/common";
export const SUCCESS_RESPONSES = {
  CREATED: {
    MESSAGE: "Created successfully.",
    STATUS_CODE: HttpStatus.CREATED,
  },
  UPDATED: {
    MESSAGE: "Updated successfully.",
    STATUS_CODE: HttpStatus.OK,
  },
  DELETED: {
    MESSAGE: "Deleted successfully.",
    STATUS_CODE: HttpStatus.OK,
  },
};

export const DYNAMIC_SUCCESS_RESPONSE = {
  CREATED: (message: string) => ({
    MESSAGE: `${message} created successfully.`,
  }),
  UPDATED: (message: string) => ({
    MESSAGE: `${message} updated successfully.`,
  }),
  DELETED: (message: string) => ({
    MESSAGE: `${message} deleted successfully.`,
  }),
  RETRIEVED: (message: string) => ({
    MESSAGE: `${message} retrieved successfully.`,
  }),
};
