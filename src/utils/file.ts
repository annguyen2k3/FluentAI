import { Request } from 'express'
import { Fields, File } from 'formidable'
import fs from 'node:fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true })
  }
  if (!fs.existsSync(UPLOAD_IMAGE_DIR)) {
    fs.mkdirSync(UPLOAD_IMAGE_DIR, { recursive: true })
  }
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFileSize: 1024 * 1024 * 5, // 5MB
    maxFields: 4,
    maxTotalFileSize: 1024 * 1024 * 20, // 20MB
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'images' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        form.emit(
          'error' as any,
          new Error(
            'Ảnh upload phải có key là file hình có key là images'
          ) as any
        )
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.images)) {
        return reject(new Error('Không có ảnh upload'))
      }
      resolve(files.images as File[])
    })
  })
}

export const handleUploadAudio = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFileSize: 1024 * 1024 * 10,
    maxFields: 10,
    keepExtensions: true,
    filter: function ({ name, mimetype }) {
      const valid = name === 'audio' && Boolean(mimetype?.includes('audio'))
      if (!valid) {
        form.emit(
          'error' as any,
          new Error('Audio upload phải có key audio và đúng định dạng') as any
        )
      }
      return valid
    }
  })
  return new Promise<{ fields: Fields; file: File }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      const audioFile = files.audio
      if (!audioFile) {
        return reject(new Error('Không có audio upload'))
      }
      const file = Array.isArray(audioFile) ? audioFile[0] : audioFile
      resolve({ fields, file })
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const handleUploadExcel = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    maxFileSize: 1024 * 1024 * 10, // 10MB
    maxFields: 1,
    keepExtensions: true,
    filter: function ({ name, mimetype }) {
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ]
      const valid =
        name === 'excelFile' &&
        Boolean(mimetype && allowedMimes.includes(mimetype))
      if (!valid) {
        form.emit(
          'error' as any,
          new Error(
            'Chỉ chấp nhận file Excel (.xlsx, .xls) với key là excelFile'
          ) as any
        )
      }
      return valid
    }
  })

  return new Promise<Buffer>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      const excelFile = files.excelFile
      if (!excelFile) {
        return reject(new Error('Không có file Excel upload'))
      }

      const file = Array.isArray(excelFile) ? excelFile[0] : excelFile
      const filePath = file.filepath

      try {
        // Đọc file vào buffer
        const buffer = await fs.promises.readFile(filePath)
        // Xóa file tạm
        await fs.promises.unlink(filePath)
        resolve(buffer)
      } catch (error) {
        // Xóa file tạm nếu có lỗi
        try {
          await fs.promises.unlink(filePath)
        } catch {}
        reject(error)
      }
    })
  })
}
