import { Request, Response } from 'express'
import Admin from '~/models/schemas/admin.schema'
import { config } from 'dotenv'
import { HttpStatus } from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import shareDocumentServices from '~/services/share-document.services'
import ShareDocument from '~/models/schemas/share-document.schema'

config()
const prefixAdmin = process.env.PREFIX_ADMIN

export const renderManageShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  res.render('admin/pages/share-document.pug', {
    pageTitle: 'Quản lý tài liệu chia sẻ',
    admin,
    prefixAdmin
  })
}

export const renderShareDocumentFormController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const documentId = req.params.documentId
  let document = null
  let isEdit = false

  if (documentId) {
    isEdit = true
    document = await shareDocumentServices.getById(documentId)
    if (!document) {
      res.redirect(`${prefixAdmin}/share-document`)
      return
    }
  }

  res.render('admin/pages/share-document-form.pug', {
    pageTitle: isEdit ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới',
    admin,
    prefixAdmin,
    isEdit,
    documentId: documentId || null,
    document
  })
}

export const getListShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const searchParam = req.query.search as string | undefined
  const sortKeyParam = req.query.sortKey as string | undefined
  const sortOrderParam = req.query.sortOrder as 'asc' | 'desc' | undefined
  const isActiveParam = req.query.isActive as string | undefined

  const search = searchParam ? searchParam.trim() : ''
  const sortKey = sortKeyParam ? sortKeyParam.trim() : 'create_at'
  const sortOrder = sortOrderParam
    ? (sortOrderParam.trim() as 'asc' | 'desc')
    : 'desc'
  const isActive =
    isActiveParam !== undefined && isActiveParam !== ''
      ? isActiveParam === 'true'
      : undefined

  const data = await shareDocumentServices.getList({
    page,
    limit,
    search,
    sortKey,
    sortOrder,
    isActive
  })

  res.status(HttpStatus.OK).json({
    message: 'Danh sách tài liệu chia sẻ đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

export const createShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const { title, author, content, isActive } = req.body

  if (!title || !content) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Tiêu đề và nội dung là bắt buộc'
    })
    return
  }

  const shareDocument = new ShareDocument({
    title,
    author: author || 'Quản trị viên',
    content,
    isActive:
      isActive !== undefined ? isActive === true || isActive === 'true' : true
  })

  const result = await shareDocumentServices.create(shareDocument)

  res.status(HttpStatus.CREATED).json({
    message: 'Tài liệu chia sẻ đã được tạo thành công',
    status: HttpStatus.CREATED,
    shareDocument: result
  })
}

export const updateShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const { documentId, title, author, content, isActive } = req.body

  if (!documentId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'ID tài liệu là bắt buộc'
    })
    return
  }

  const existing = await shareDocumentServices.getById(documentId)
  if (!existing) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Tài liệu không tồn tại'
    })
    return
  }

  const updateData: any = {
    _id: new ObjectId(documentId),
    title: title !== undefined ? title : existing.title,
    author: author !== undefined ? author : existing.author,
    content: content !== undefined ? content : existing.content,
    isActive:
      isActive !== undefined
        ? isActive === true || isActive === 'true'
        : (existing.isActive ?? true),
    create_at: existing.create_at || new Date()
  }

  const shareDocument = new ShareDocument(updateData)
  const result = await shareDocumentServices.update(shareDocument)

  res.status(HttpStatus.OK).json({
    message: 'Tài liệu chia sẻ đã được cập nhật thành công',
    status: HttpStatus.OK,
    shareDocument: result
  })
}

export const deleteShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const { documentId } = req.body

  if (!documentId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'ID tài liệu là bắt buộc'
    })
    return
  }

  const existing = await shareDocumentServices.getById(documentId)
  if (!existing) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Tài liệu không tồn tại'
    })
    return
  }

  await shareDocumentServices.delete(documentId)

  res.status(HttpStatus.OK).json({
    message: 'Tài liệu chia sẻ đã được xóa thành công',
    status: HttpStatus.OK
  })
}

export const duplicateShareDocumentController = async (
  req: Request,
  res: Response
) => {
  const { documentId } = req.body

  if (!documentId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'ID tài liệu là bắt buộc'
    })
    return
  }

  const existing = await shareDocumentServices.getById(documentId)
  if (!existing) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Tài liệu không tồn tại'
    })
    return
  }

  const result = await shareDocumentServices.duplicate(documentId)

  if (!result) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Có lỗi xảy ra khi duplicate tài liệu'
    })
    return
  }

  res.status(HttpStatus.CREATED).json({
    message: 'Tài liệu chia sẻ đã được duplicate thành công',
    status: HttpStatus.CREATED,
    shareDocument: result
  })
}
