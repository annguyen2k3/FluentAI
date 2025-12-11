import { Router } from 'express'
import {
  createLVListController,
  deleteLVListController,
  getListLvController,
  renderManageLvController,
  updateLVListController
} from '~/controllers/admin/manage-lv.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createLVListValidator,
  updateLVListValidator
} from '~/middlewares/listening-video.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const manageLvRoutes = Router()

manageLvRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageLvController)
)

manageLvRoutes.get(
  '/list',
  requireAdminAuth,
  wrapRequestHandler(getListLvController)
)

manageLvRoutes.post(
  '/create',
  requireAdminAuth,
  createLVListValidator,
  wrapRequestHandler(createLVListController)
)

manageLvRoutes.put(
  '/update',
  requireAdminAuth,
  updateLVListValidator,
  wrapRequestHandler(updateLVListController)
)

manageLvRoutes.delete(
  '/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteLVListController)
)

export default manageLvRoutes
