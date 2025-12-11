import { Router } from 'express'
import {
  deleteUserController,
  getListUsersController,
  lockUserController,
  logoutUserController,
  renderManageUserController,
  renderManageUserScoreController,
  unlockUserController,
  updateUserManageController
} from '~/controllers/admin/manage-user.controller'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  getListValidator,
  updateUserManageValidator,
  userIdExistsValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const manageUserRoutes = Router()

// GET /admin/users
// Description: Render page manage users
manageUserRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageUserController)
)

// GET /admin/users/list
// Description: Get list of users
// Query: page, limit, status, search, sort, startDate, endDate
manageUserRoutes.get(
  '/list',
  requireAdminAuth,
  getListValidator,
  wrapRequestHandler(getListUsersController)
)

// GET /admin/users/score
// Description: Render page manage users score
manageUserRoutes.get(
  '/score/:userId',
  requireAdminAuth,
  wrapRequestHandler(renderManageUserScoreController)
)

// POST /admin/users/lock
// Description: Lock user
// Body: userId
manageUserRoutes.post(
  '/lock',
  requireAdminAuth,
  userIdExistsValidator,
  wrapRequestHandler(lockUserController)
)

// POST /admin/users/unlock
// Description: Unlock user
// Body: userId
manageUserRoutes.post(
  '/unlock',
  requireAdminAuth,
  userIdExistsValidator,
  wrapRequestHandler(unlockUserController)
)

// POST /admin/users/logout
// Description: Logout user
// Body: userId
manageUserRoutes.post(
  '/logout',
  requireAdminAuth,
  userIdExistsValidator,
  wrapRequestHandler(logoutUserController)
)

// DELETE /admin/users/delete
// Description: Delete user
// Body: userId
manageUserRoutes.delete(
  '/delete',
  requireAdminAuth,
  userIdExistsValidator,
  wrapRequestHandler(deleteUserController)
)

// PUT /admin/users/update
// Description: Update user manage
// Body: userId, username, email, dateOfBirth, phoneNumber, gender
manageUserRoutes.put(
  '/update',
  requireAdminAuth,
  updateUserManageValidator,
  wrapRequestHandler(updateUserManageController)
)

export default manageUserRoutes
