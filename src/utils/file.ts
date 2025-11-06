import { Request } from 'express'
import { File } from 'formidable'
import fs from 'node:fs'
import path from 'path'
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
        maxFileSize: 1024 * 1024 * 5, // 1MB
        maxFields: 4,
        maxTotalFileSize: 1024 * 1024 * 20,  // 4MB
        keepExtensions: true,
        filter: function({name, originalFilename, mimetype}) {
            const valid = name === 'images' && Boolean(mimetype?.includes('image'))
            if (!valid) {
                form.emit('error' as any, new Error('Ảnh upload phải có key là file hình có key là images') as any)
            }
            return valid
        }
    })
    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {

            if (err) {
                return reject(err)
            }
            if(!Boolean(files.images)) {
                return reject(new Error('Không có ảnh upload'))
            }
            resolve(files.images as File[])
        })
    })
    
}

export const getNameFromFullName = (fullName: string) => {
    const nameArr = fullName.split('.')
    nameArr.pop()
    return nameArr.join('')
}