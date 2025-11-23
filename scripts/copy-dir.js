const fs = require('fs-extra')

const listFolderCopy = [
  {
    sourceDirectory: 'src/views',
    targetDirectory: 'dist/views'
  },
  {
    sourceDirectory: 'src/public',
    targetDirectory: 'dist/public'
  }
]

async function copyFolders() {
  for (const item of listFolderCopy) {
    try {
      await fs.copy(item.sourceDirectory, item.targetDirectory)
      console.log(`Sao chép thành công thư mục ${item.sourceDirectory}`)
    } catch (err) {
      console.error(`Lỗi sao chép thư mục ${item.sourceDirectory}:`, err)
      process.exit(1)
    }
  }
}

copyFolders()
