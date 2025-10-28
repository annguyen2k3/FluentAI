import { HttpStatus } from '~/constants/httpStatus'
import { COMMON_MESSAGES } from '~/constants/message'

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

  constructor({ message = COMMON_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY)
    this.errors = errors
  }
}
