import { checkSchema } from "express-validator";
import { USER_MESSAGE } from "~/constants/message";
import { validate } from "~/utils/validation";

export const loginValidator = validate(checkSchema({
    email: {
        isEmail: {
            errorMessage: USER_MESSAGE.EMAIL_INVALID
        },
        trim: true,
    },
    password: {
        isStrongPassword: {
            options: {
              minLength: 6,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1
            }
          },
          errorMessage: USER_MESSAGE.PASSWORD_STRONG
    }
}, ['body']))