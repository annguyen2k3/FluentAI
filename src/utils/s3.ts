import {config} from 'dotenv'
import { S3 } from '@aws-sdk/client-s3'
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
    contentType
} : {
    filename: string,
    filepath: string,
    contentType: string,
})  => {
    const parallelUploads3 = new Upload({
        client: s3,
        params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filename,
            Body: fs.readFileSync(path.resolve(filepath)),
            ContentType: contentType,
        },
        tags: [],
        queueSize: 4,
        partSize: 1024 * 1024 * 5, // 5MB
        leavePartsOnError: false, // false: delete the parts that have been uploaded
    })

    return parallelUploads3.done()
}

export const deleteFileFromS3 = ({
    filename
} : {
    filename: string,
}) => {
    return s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filename,
    })
}
