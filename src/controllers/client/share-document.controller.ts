import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import shareDocumentServices from '~/services/share-document.services'

// GET /share-document
export const renderShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User

  res.render('client/pages/share-document/list.pug', {
    pageTitle: 'Tài liệu chia sẻ',
    user
  })
}

// GET /share-document/list
export const getShareDocumentListController = async (
  req: Request,
  res: Response
) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const search = req.query.search as string | undefined
  const sortKey = req.query.sortKey as string | undefined
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined

  const find: {
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
  } = {}

  if (page) {
    find.page = page
  }
  if (limit) {
    find.limit = limit
  }
  if (search) {
    find.search = search
  }
  if (sortKey) {
    find.sortKey = sortKey
  }
  if (sortOrder) {
    find.sortOrder = sortOrder
  }
  find.isActive = true

  const shareDocumentList = await shareDocumentServices.getList(find)
  res.status(HttpStatus.OK).json({
    message: 'Tài liệu chia sẻ đã được lấy thành công',
    status: HttpStatus.OK,
    shareDocumentList
  })
}

// GET /share-document/:slug
export const getShareDocumentByIdController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug
  const shareDocument = await shareDocumentServices.getBySlug(slug, true)
  if (!shareDocument) {
    res.redirect('/share-document')
    return
  }
  res.render('client/pages/share-document/detail.pug', {
    pageTitle: shareDocument.title,
    user,
    shareDocument
  })
}

// POST /share-document/bookmark
export const bookmarkShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const userId = (user._id as ObjectId).toString()
  const shareDocumentId = req.body.shareDocumentId as string
  const isBookmarked = await shareDocumentServices.bookmark(
    userId,
    shareDocumentId
  )
  if (isBookmarked) {
    res.status(HttpStatus.OK).json({
      message: 'Đánh dấu thành công',
      status: HttpStatus.OK
    })
  } else {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Đánh dấu thất bại',
      status: HttpStatus.BAD_REQUEST
    })
  }
}

// POST /share-document/unbookmark
export const unbookmarkShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const userId = (user._id as ObjectId).toString()
  const shareDocumentId = req.body.shareDocumentId as string
  const isUnbookmarked = await shareDocumentServices.unbookmark(
    userId,
    shareDocumentId
  )

  if (isUnbookmarked) {
    res.status(HttpStatus.OK).json({
      message: 'Bỏ đánh dấu thành công',
      status: HttpStatus.OK
    })
  } else {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Bỏ đánh dấu thất bại',
      status: HttpStatus.BAD_REQUEST
    })
  }
}
