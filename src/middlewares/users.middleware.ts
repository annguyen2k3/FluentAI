import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { capitalize } from "lodash";
import md5 from "md5";
import { VerifyEmailType } from "~/constants/enum";
import { USER_MESSAGES } from "~/constants/message";
import { databaseService } from "~/services/database.service";
import userService from "~/services/users.service";
import { verifyToken } from "~/utils/jwt";
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

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies?.access_token as string
    const refresh_token = req.cookies?.refresh_token as string

    if(!access_token || !refresh_token) {
        return res.redirect('/users/login')
    }

    const refresh_token_exists = await databaseService.refreshTokens.findOne({ token: refresh_token })
    if(refresh_token_exists === null) {
        return res.redirect('/users/login')
    }

    try {
        const decoded = await verifyToken({ token: access_token, secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string})
        const user = await userService.getUserById(decoded.user_id)
        if(!user) {
            return res.redirect('/users/login')
        }
        req.user = user
        next()
    } catch (error: any) {
        if (error?.name === 'TokenExpiredError') {
            try {
                const decoded = await verifyToken({ token: refresh_token, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string})
            
                const user = await userService.getUserById(decoded.user_id)
                if(!user) {
                    return res.redirect('/users/login')
                }
                req.user = user
                const new_tokens = await userService.login(user._id.toString())
                res.cookie('access_token', new_tokens.access_token, {
                    httpOnly: true,
                    sameSite: 'lax',
                })
                res.cookie('refresh_token', new_tokens.refresh_token, {
                    httpOnly: true,
                    sameSite: 'lax',
                })
                return next()
            } catch (error) {
                return res.redirect('/users/login')
            }
            
        }
        return res.redirect('/users/login')
    }
}