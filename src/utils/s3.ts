import { config } from 'dotenv'
import { DeleteObjectCommand, S3 } from '@aws-sdk/client-s3'
import fs from 'node:fs'
import { Upload } from '@aws-sdk/lib-storage'
import path from 'path'
config()

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType,
  tags = []
}: {
  filename: string
  filepath: string
  contentType: string
  tags?: { Key: string; Value: string }[]
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: fs.readFileSync(path.resolve(filepath)),
      ContentType: contentType
    },
    tags: tags,
    queueSize: 4,
    partSize: 1024 * 1024 * 5, // 5MB
    leavePartsOnError: false // false: delete the parts that have been uploaded
  })

  return parallelUploads3.done()
}

export const deleteFileFromS3 = async ({ filename }: { filename: string }) => {
  if (!filename) {
    return
  }

  let key = filename

  if (
    filename.includes('amazonaws.com') ||
    filename.startsWith('http://') ||
    filename.startsWith('https://')
  ) {
    try {
      const url = new URL(filename)
      key = url.pathname.substring(1)
    } catch (error) {
      console.error('Error parsing URL:', error)
      return
    }
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key
  }

  try {
    const command = new DeleteObjectCommand(params)
    const result = await s3.send(command)
    return result
  } catch (error) {
    console.error(
      `Error deleting file '${key}' from bucket '${process.env.AWS_S3_BUCKET_NAME}':`,
      error
    )
    throw error
  }
}
