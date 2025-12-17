import { config } from 'dotenv'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'node:fs'
config()
import { getNameFromFullName, handleUploadImage } from '~/utils/file'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enum'
import { uploadFileToS3 } from '~/utils/s3'
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

class MediasService {
  async uploadImage(req: Request, folderS3: string = '') {
    const file = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      file.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newFullName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const cleanFolder = folderS3.replace(/^\/+|\/+$/g, '')
        const s3Key = cleanFolder
          ? `${cleanFolder}/${newFullName}`
          : newFullName
        const s3Result = await uploadFileToS3({
          filename: s3Key,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([
          fs.unlinkSync(file.filepath),
          fs.unlinkSync(newPath)
        ])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput)
            .Location as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
