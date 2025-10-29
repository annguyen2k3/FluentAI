import { checkSchema } from "express-validator";
import md5 from "md5";
import { VerifyEmailType } from "~/constants/enum";
import { USER_MESSAGES } from "~/constants/message";
import { databaseService } from "~/services/database.service";
import userService from "~/services/users.service";
import { validate } from "~/utils/validation";

export const loginValidator = validate(checkSchema({
    email: {
        isEmail: {
            errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const isExists = await userService.checkEmailExists(value)
                if(!isExists) {
                    throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
                }
               
                return true
            }
        }
    },
    password: {
        isLength: {
            options: {
                min: 1
            },
            errorMessage: USER_MESSAGES.PASSWORD_REQUIRED
        },
        custom: {
            options: async (value, { req }) => {
                const user = await databaseService.users.findOne({email: req.body.email, password: md5(value)})
                if(user === null) {
                    throw new Error(USER_MESSAGES.PASSWORD_INCORRECT)
                }
                req.user = user
                return true
            }
        }
    }
}, ['body']))

export const registerValidator = validate(checkSchema({
    email: {
        isEmail: {
            errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const isExists = await userService.checkEmailExists(value)
                if(isExists) {
                    throw new Error(USER_MESSAGES.EMAIL_EXISTS)
                }
               
                return true
            }
        }
    },
    password: {
        isStrongPassword: {
            options: {
              minLength: 6,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1
            },
            errorMessage: USER_MESSAGES.PASSWORD_STRONG
        },
    },
    passwordConfirm: {
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error(USER_MESSAGES.PASSWORD_NOT_MATCH)
                }
                return true
            }
        }
    }
}, ['body']))

export const verifyEmailValidator = validate(checkSchema({
    otp: {
        isLength: {
            options: {
                min: 4,
                max: 4
            },
            errorMessage: USER_MESSAGES.OTP_INVALID
        },
        custom: {
            options: async (value, { req }) => {
                const email = req.cookies?.emailRegister as string
                const otp = await databaseService.otpVerifyEmail.findOne({ email, otp: value, type: VerifyEmailType.RESISTER })
                if(!otp) {
                    throw new Error(USER_MESSAGES.OTP_INVALID)
                }
                return true
            }
        }
    }
}, ['body']))

export const forgotPasswordEmailValidator = validate(checkSchema({
    email: {
        isEmail: {
            errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const isExists = await userService.checkEmailExists(value)
                if(!isExists) {
                    throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
                }
                return true
            }
        }
    }
}, ['body']))

export const forgotPasswordOTPValidator = validate(checkSchema({
    otp: {
        isLength: {
            options: {
                min: 4,
                max: 4
            },
            errorMessage: USER_MESSAGES.OTP_INVALID
        },
        custom: {
            options: async (value, { req }) => {
                const email = req.cookies?.emailForgotPassword as string
                const otp = await databaseService.otpVerifyEmail.findOne({ email, otp: value, type: VerifyEmailType.FORGOT_PASSWORD })
                if(!otp) {
                    throw new Error(USER_MESSAGES.OTP_INVALID)
                }
                return true
            }
        }
    }
}, ['body']))

export const forgotPasswordResetValidator = validate(checkSchema({
    password: {
        isStrongPassword: {
            options: {
              minLength: 6,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1
            },
            errorMessage: USER_MESSAGES.PASSWORD_STRONG
        },
    },
    passwordConfirm: {
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error(USER_MESSAGES.PASSWORD_NOT_MATCH)
                }
                return true
            }
        }
    }
}, ['body']))