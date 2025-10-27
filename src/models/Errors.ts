import { HttpStatus } from '~/constants/httpStatus';
import { COMMON_MESSAGES } from '~/constants/message';

type ErrorsType = Record<string, { msg: string; [key: string]: any }>

export class ErrorWithStatus {
  message: string
  status: number

  constructor(message: string, status: number) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType

  constructor({ message = COMMON_MESSAGES.VALIDATION_ERROR, status = HttpStatus.UNPROCESSABLE_ENTITY, errors }: { message?: string; status?: number; errors: ErrorsType }) {
    super(message, status)
    this.errors = errors
  }
}
