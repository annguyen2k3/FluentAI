import ExcelJS from 'exceljs'
import { ObjectId } from 'mongodb'
import WSList, { SentenceWriteType } from '~/models/schemas/ws-list.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import SSList, { SentenceSpeakingType } from '~/models/schemas/ss-list.schema'
import SVShadowing, {
  ShadowingSentenceType
} from '~/models/schemas/sv-shadowing.schema'
import ListeningVideo, {
  TranscriptSentenceType,
  QuestionType
} from '~/models/schemas/lv-video.schemas'
import { VocabularyHintType } from '~/models/Other'
import { PartOfSpeech } from '~/constants/enum'
import categoriesServices from '~/services/categories.service'
import { normalizeYouTubeUrl } from '~/utils/format'

class ExcelService {
  /**
   * Extract URL from Excel cell value (handles hyperlink objects)
   */
  private extractUrlFromCell(cellValue: any): string {
    if (!cellValue) return ''

    if (typeof cellValue === 'string') {
      return cellValue.trim()
    }

    if (cellValue && typeof cellValue === 'object') {
      if (cellValue.text) {
        return String(cellValue.text).trim()
      }
      if (cellValue.hyperlink) {
        return String(cellValue.hyperlink).trim()
      }
      if (cellValue.value) {
        return this.extractUrlFromCell(cellValue.value)
      }
      if (cellValue.toString && typeof cellValue.toString === 'function') {
        const str = cellValue.toString()
        if (str && str !== '[object Object]') {
          return str.trim()
        }
      }
    }

    return String(cellValue || '').trim()
  }

  /**
   * Extract YouTube video ID from URL
   */
  private extractYouTubeVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') return null

    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
      return match ? match[1] : null
    }

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  /**
   * Generate YouTube thumbnail URL from video URL
   */
  private generateYouTubeThumbnailUrl(videoUrl: string): string | undefined {
    if (!videoUrl || typeof videoUrl !== 'string') return undefined

    const videoId = this.extractYouTubeVideoId(videoUrl)
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return undefined
  }

  /**
   * Tạo file Excel template với sheet SETUP và dropdown
   * @returns Buffer của file Excel
   */
  async createWSTemplate(): Promise<Buffer | ArrayBuffer> {
    const workbook = new ExcelJS.Workbook()

    const setupSheet = workbook.addWorksheet('SETUP')

    const topics = await categoriesServices.getTopics()
    const levels = await categoriesServices.getLevels()
    const partOfSpeechOptions = Object.values(PartOfSpeech)

    setupSheet.getCell('A1').value = 'TOPIC_ID'
    setupSheet.getCell('B1').value = 'TOPIC_TITLE'
    topics.forEach((topic, index) => {
      setupSheet.getCell(`A${index + 2}`).value = topic._id?.toString() || ''
      setupSheet.getCell(`B${index + 2}`).value = topic.title || ''
    })

    setupSheet.getCell('D1').value = 'LEVEL_ID'
    setupSheet.getCell('E1').value = 'LEVEL_TITLE'
    levels.forEach((level, index) => {
      setupSheet.getCell(`D${index + 2}`).value = level._id?.toString() || ''
      setupSheet.getCell(`E${index + 2}`).value = level.title || ''
    })

    setupSheet.getCell('G1').value = 'TYPE_VALUE'
    setupSheet.getCell('H1').value = 'TYPE_LABEL'
    const typeLabels: Record<string, string> = {
      noun: 'Danh từ',
      verb: 'Động từ',
      adjective: 'Tính từ',
      adverb: 'Trạng từ',
      pronoun: 'Đại từ',
      preposition: 'Giới từ',
      conjunction: 'Liên từ',
      interjection: 'Thán từ',
      other: 'Khác'
    }
    partOfSpeechOptions.forEach((type, index) => {
      setupSheet.getCell(`G${index + 2}`).value = type
      setupSheet.getCell(`H${index + 2}`).value = typeLabels[type] || type
    })

    setupSheet.getRow(1).font = { bold: true }
    setupSheet.columns.forEach((col) => {
      col.width = 20
    })
    setupSheet.state = 'hidden'

    const worksheet = workbook.addWorksheet('Template')

    worksheet.addRow(['TITLE', 'TOPIC', 'LEVEL', 'SLUG', 'POS', 'IS_ACTIVE'])
    worksheet.addRow([
      'Chào hỏi cơ bản',
      topics[0]?.title || '',
      levels[0]?.title || '',
      'chao-hoi-co-ban',
      '1',
      'true'
    ])

    worksheet.addRow([])

    const maxHints = 5
    const headerRow = ['SENTENCE_POS', 'SENTENCE_CONTENT']
    for (let i = 1; i <= maxHints; i++) {
      headerRow.push(
        `HINT_VOCAB_EN${i}`,
        `HINT_TRANSLATE${i}`,
        `HINT_TYPE${i}`,
        `HINT_EXAMPLE_EN${i}`,
        `HINT_EXAMPLE_VI${i}`
      )
    }
    worksheet.addRow(headerRow)

    const exampleRow1 = [
      '1',
      'Xin chào, dạo này khoẻ không?',
      'hello',
      'xin chào',
      'Danh từ',
      'Hello, nice to meet you.',
      'Xin chào, rất vui được gặp bạn.',
      'how',
      'như thế nào',
      'Trạng từ',
      'How are you doing?',
      'Bạn đang làm gì?'
    ]
    for (let i = 3; i <= maxHints; i++) {
      exampleRow1.push('', '', '', '', '')
    }
    worksheet.addRow(exampleRow1)

    const exampleRow2 = [
      '2',
      'Bạn tên gì?',
      'what',
      'cái gì',
      'Đại từ',
      'What do you want?',
      'Bạn muốn gì?'
    ]
    for (let i = 2; i <= maxHints; i++) {
      exampleRow2.push('', '', '', '', '')
    }
    worksheet.addRow(exampleRow2)

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(4).font = { bold: true }

    const topicRange = `SETUP!$B$2:$B$${topics.length + 1}`
    worksheet.getCell('B2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [topicRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách chủ đề'
    }

    const levelRange = `SETUP!$E$2:$E$${levels.length + 1}`
    worksheet.getCell('C2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [levelRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách cấp độ'
    }

    const typeRange = `SETUP!$H$2:$H$${partOfSpeechOptions.length + 1}`
    const typeColumns = ['E', 'J', 'O', 'T', 'Y']
    for (let row = 5; row <= 7; row++) {
      typeColumns.forEach((col) => {
        worksheet.getCell(`${col}${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [typeRange],
          showErrorMessage: true,
          errorStyle: 'stop',
          errorTitle: 'Lỗi',
          error: 'Vui lòng chọn từ danh sách loại từ'
        }
      })
    }

    worksheet.columns.forEach((column) => {
      column.width = 20
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * Import file Excel và parse thành mảng WSList
   * @param fileBuffer Buffer của file Excel
   * @returns Mảng các WSList đã được parse
   */
  async importWSList(fileBuffer: Buffer | ArrayBuffer): Promise<WSList[]> {
    const workbook = new ExcelJS.Workbook()
    let buffer: Buffer
    if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer
    } else {
      buffer = Buffer.from(new Uint8Array(fileBuffer as ArrayBuffer))
    }
    await workbook.xlsx.load(buffer as any)

    const wsLists: WSList[] = []

    const setupSheet = workbook.getWorksheet('SETUP')
    if (!setupSheet) {
      throw new Error('Không tìm thấy sheet SETUP trong file Excel')
    }

    const topicIdToTitleMap = new Map<string, string>()
    const topicTitleToIdMap = new Map<string, string>()
    const levelIdToTitleMap = new Map<string, string>()
    const levelTitleToIdMap = new Map<string, string>()
    const typeLabelToValueMap = new Map<string, string>()

    let row = 2
    while (setupSheet.getCell(`A${row}`).value) {
      const topicId = String(setupSheet.getCell(`A${row}`).value || '').trim()
      const topicTitle = String(
        setupSheet.getCell(`B${row}`).value || ''
      ).trim()
      if (topicId && topicTitle) {
        topicIdToTitleMap.set(topicId, topicTitle)
        topicTitleToIdMap.set(topicTitle, topicId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`D${row}`).value) {
      const levelId = String(setupSheet.getCell(`D${row}`).value || '').trim()
      const levelTitle = String(
        setupSheet.getCell(`E${row}`).value || ''
      ).trim()
      if (levelId && levelTitle) {
        levelIdToTitleMap.set(levelId, levelTitle)
        levelTitleToIdMap.set(levelTitle, levelId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`G${row}`).value) {
      const typeValue = String(setupSheet.getCell(`G${row}`).value || '').trim()
      const typeLabel = String(setupSheet.getCell(`H${row}`).value || '').trim()
      if (typeValue && typeLabel) {
        typeLabelToValueMap.set(typeLabel, typeValue)
      }
      row++
    }

    workbook.eachSheet((worksheet) => {
      if (worksheet.name === 'SETUP') {
        return
      }

      const rows = worksheet.getSheetValues() as any[][]
      if (rows.length < 5) {
        return
      }

      const headerRow = rows[1] || []
      const dataRow = rows[2] || []

      if (
        headerRow[1] !== 'TITLE' ||
        headerRow[2] !== 'TOPIC' ||
        headerRow[3] !== 'LEVEL'
      ) {
        throw new Error(
          `Sheet "${worksheet.name}": Định dạng file không đúng. Vui lòng sử dụng file template mới nhất.`
        )
      }

      const title = String(dataRow[1] || '').trim()
      const topicTitle = String(dataRow[2] || '').trim()
      const levelTitle = String(dataRow[3] || '').trim()
      const slug = String(dataRow[4] || '').trim()
      const pos = Number(dataRow[5]) || 1

      let isActive = true
      const isActiveValue = dataRow[6]
      if (
        isActiveValue !== undefined &&
        isActiveValue !== null &&
        isActiveValue !== ''
      ) {
        if (typeof isActiveValue === 'boolean') {
          isActive = isActiveValue
        } else {
          const isActiveStr = String(isActiveValue).trim().toLowerCase()
          isActive = isActiveStr === 'true' || isActiveStr === '1'
        }
      }

      if (!title || !topicTitle || !levelTitle) {
        throw new Error(
          `Sheet "${worksheet.name}": Thiếu thông tin bắt buộc (TITLE, TOPIC, LEVEL)`
        )
      }

      const topicId = topicTitleToIdMap.get(topicTitle)
      const levelId = levelTitleToIdMap.get(levelTitle)

      if (!topicId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy chủ đề "${topicTitle}" trong bảng lookup`
        )
      }

      if (!levelId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy cấp độ "${levelTitle}" trong bảng lookup`
        )
      }

      if (!ObjectId.isValid(topicId)) {
        throw new Error(
          `Sheet "${worksheet.name}": TOPIC_ID không hợp lệ: ${topicId}`
        )
      }

      if (!ObjectId.isValid(levelId)) {
        throw new Error(
          `Sheet "${worksheet.name}": LEVEL_ID không hợp lệ: ${levelId}`
        )
      }

      const sentences: SentenceWriteType[] = []
      const maxHints = 5

      for (let i = 5; i <= rows.length; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const sentencePos = Number(row[1] || 0)
        const sentenceContent = String(row[2] || '').trim()

        if (!sentenceContent) continue

        const hints: VocabularyHintType[] = []

        for (let hintIndex = 0; hintIndex < maxHints; hintIndex++) {
          const baseColIndex = 3 + hintIndex * 5
          const hintVocabEn = String(row[baseColIndex] || '').trim()
          const hintTranslate = String(row[baseColIndex + 1] || '').trim()
          const hintTypeLabel = String(row[baseColIndex + 2] || '').trim()
          const hintExampleEn = String(row[baseColIndex + 3] || '').trim()
          const hintExampleVi = String(row[baseColIndex + 4] || '').trim()

          if (hintVocabEn && hintTranslate && hintTypeLabel) {
            const hintTypeValue =
              typeLabelToValueMap.get(hintTypeLabel) || hintTypeLabel

            const hint: VocabularyHintType = {
              vocabulary_en: hintVocabEn,
              translate: hintTranslate,
              type: hintTypeValue as PartOfSpeech,
              sentence_example:
                hintExampleEn && hintExampleVi
                  ? {
                      en: hintExampleEn,
                      vi: hintExampleVi
                    }
                  : undefined
            }
            hints.push(hint)
          }
        }

        sentences.push({
          pos: sentencePos,
          content: sentenceContent,
          hint: hints
        })
      }

      const list = sentences.sort((a, b) => a.pos - b.pos)

      if (list.length === 0) {
        throw new Error(
          `Sheet "${worksheet.name}": Không có câu nào trong danh sách`
        )
      }

      const wsList = new WSList({
        title,
        topic: new ObjectId(topicId),
        level: new ObjectId(levelId),
        slug: slug || undefined,
        pos,
        isActive,
        list
      })

      wsLists.push(wsList)
    })

    return wsLists
  }

  async createWPTemplate(): Promise<Buffer | ArrayBuffer> {
    const workbook = new ExcelJS.Workbook()

    const setupSheet = workbook.addWorksheet('SETUP')

    const topics = await categoriesServices.getTopics()
    const levels = await categoriesServices.getLevels()
    const types = await categoriesServices.getTypes()
    const partOfSpeechOptions = Object.values(PartOfSpeech)

    setupSheet.getCell('A1').value = 'TOPIC_ID'
    setupSheet.getCell('B1').value = 'TOPIC_TITLE'
    topics.forEach((topic, index) => {
      setupSheet.getCell(`A${index + 2}`).value = topic._id?.toString() || ''
      setupSheet.getCell(`B${index + 2}`).value = topic.title || ''
    })

    setupSheet.getCell('D1').value = 'LEVEL_ID'
    setupSheet.getCell('E1').value = 'LEVEL_TITLE'
    levels.forEach((level, index) => {
      setupSheet.getCell(`D${index + 2}`).value = level._id?.toString() || ''
      setupSheet.getCell(`E${index + 2}`).value = level.title || ''
    })

    setupSheet.getCell('G1').value = 'TYPE_ID'
    setupSheet.getCell('H1').value = 'TYPE_TITLE'
    types.forEach((type, index) => {
      setupSheet.getCell(`G${index + 2}`).value = type._id?.toString() || ''
      setupSheet.getCell(`H${index + 2}`).value = type.title || ''
    })

    setupSheet.getCell('J1').value = 'PART_OF_SPEECH_VALUE'
    setupSheet.getCell('K1').value = 'PART_OF_SPEECH_LABEL'
    const typeLabels: Record<string, string> = {
      noun: 'Danh từ',
      verb: 'Động từ',
      adjective: 'Tính từ',
      adverb: 'Trạng từ',
      pronoun: 'Đại từ',
      preposition: 'Giới từ',
      conjunction: 'Liên từ',
      interjection: 'Thán từ',
      other: 'Khác'
    }
    partOfSpeechOptions.forEach((type, index) => {
      setupSheet.getCell(`J${index + 2}`).value = type
      setupSheet.getCell(`K${index + 2}`).value = typeLabels[type] || type
    })

    setupSheet.getRow(1).font = { bold: true }
    setupSheet.columns.forEach((col) => {
      col.width = 20
    })
    setupSheet.state = 'hidden'

    const worksheet = workbook.addWorksheet('Template')

    worksheet.addRow([
      'TITLE',
      'TOPIC',
      'LEVEL',
      'TYPE',
      'CONTENT',
      'SLUG',
      'POS',
      'IS_ACTIVE'
    ])
    worksheet.addRow([
      'Giới thiệu bản thân',
      topics[0]?.title || '',
      levels[0]?.title || '',
      types[0]?.title || '',
      'Tôi tên là John. Tôi 25 tuổi. Tôi là giáo viên.',
      'gioi-thieu-ban-than',
      '1',
      'true'
    ])

    worksheet.addRow([])

    worksheet.addRow([
      'VOCAB_EN',
      'TRANSLATE',
      'TYPE',
      'EXAMPLE_EN',
      'EXAMPLE_VI'
    ])

    worksheet.addRow([
      'introduce',
      'giới thiệu',
      'Động từ',
      'Let me introduce myself.',
      'Để tôi giới thiệu bản thân.'
    ])

    worksheet.addRow([
      'teacher',
      'giáo viên',
      'Danh từ',
      'She is a teacher.',
      'Cô ấy là giáo viên.'
    ])

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(4).font = { bold: true }

    const topicRange = `SETUP!$B$2:$B$${topics.length + 1}`
    worksheet.getCell('B2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [topicRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách chủ đề'
    }

    const levelRange = `SETUP!$E$2:$E$${levels.length + 1}`
    worksheet.getCell('C2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [levelRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách cấp độ'
    }

    const typeRange = `SETUP!$H$2:$H$${types.length + 1}`
    worksheet.getCell('D2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [typeRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách loại'
    }

    const partOfSpeechRange = `SETUP!$K$2:$K$${partOfSpeechOptions.length + 1}`
    for (let row = 5; row <= 10; row++) {
      worksheet.getCell(`C${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [partOfSpeechRange],
        showErrorMessage: true,
        errorStyle: 'stop',
        errorTitle: 'Lỗi',
        error: 'Vui lòng chọn từ danh sách loại từ'
      }
    }

    worksheet.columns.forEach((column) => {
      column.width = 20
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  async importWPList(fileBuffer: Buffer | ArrayBuffer): Promise<WPParagraph[]> {
    const workbook = new ExcelJS.Workbook()
    let buffer: Buffer
    if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer
    } else {
      buffer = Buffer.from(new Uint8Array(fileBuffer as ArrayBuffer))
    }
    await workbook.xlsx.load(buffer as any)

    const wpParagraphs: WPParagraph[] = []

    const setupSheet = workbook.getWorksheet('SETUP')
    if (!setupSheet) {
      throw new Error('Không tìm thấy sheet SETUP trong file Excel')
    }

    const topicIdToTitleMap = new Map<string, string>()
    const topicTitleToIdMap = new Map<string, string>()
    const levelIdToTitleMap = new Map<string, string>()
    const levelTitleToIdMap = new Map<string, string>()
    const typeIdToTitleMap = new Map<string, string>()
    const typeTitleToIdMap = new Map<string, string>()
    const partOfSpeechLabelToValueMap = new Map<string, string>()

    let row = 2
    while (setupSheet.getCell(`A${row}`).value) {
      const topicId = String(setupSheet.getCell(`A${row}`).value || '').trim()
      const topicTitle = String(
        setupSheet.getCell(`B${row}`).value || ''
      ).trim()
      if (topicId && topicTitle) {
        topicIdToTitleMap.set(topicId, topicTitle)
        topicTitleToIdMap.set(topicTitle, topicId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`D${row}`).value) {
      const levelId = String(setupSheet.getCell(`D${row}`).value || '').trim()
      const levelTitle = String(
        setupSheet.getCell(`E${row}`).value || ''
      ).trim()
      if (levelId && levelTitle) {
        levelIdToTitleMap.set(levelId, levelTitle)
        levelTitleToIdMap.set(levelTitle, levelId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`G${row}`).value) {
      const typeId = String(setupSheet.getCell(`G${row}`).value || '').trim()
      const typeTitle = String(setupSheet.getCell(`H${row}`).value || '').trim()
      if (typeId && typeTitle) {
        typeIdToTitleMap.set(typeId, typeTitle)
        typeTitleToIdMap.set(typeTitle, typeId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`J${row}`).value) {
      const partOfSpeechValue = String(
        setupSheet.getCell(`J${row}`).value || ''
      ).trim()
      const partOfSpeechLabel = String(
        setupSheet.getCell(`K${row}`).value || ''
      ).trim()
      if (partOfSpeechValue && partOfSpeechLabel) {
        partOfSpeechLabelToValueMap.set(partOfSpeechLabel, partOfSpeechValue)
      }
      row++
    }

    workbook.eachSheet((worksheet) => {
      if (worksheet.name === 'SETUP') {
        return
      }

      const rows = worksheet.getSheetValues() as any[][]
      if (rows.length < 5) {
        return
      }

      const headerRow = rows[1] || []
      const dataRow = rows[2] || []

      if (
        headerRow[1] !== 'TITLE' ||
        headerRow[2] !== 'TOPIC' ||
        headerRow[3] !== 'LEVEL' ||
        headerRow[4] !== 'TYPE' ||
        headerRow[5] !== 'CONTENT'
      ) {
        throw new Error(
          `Sheet "${worksheet.name}": Định dạng file không đúng. Vui lòng sử dụng file template mới nhất.`
        )
      }

      const title = String(dataRow[1] || '').trim()
      const topicTitle = String(dataRow[2] || '').trim()
      const levelTitle = String(dataRow[3] || '').trim()
      const typeTitle = String(dataRow[4] || '').trim()
      const content = String(dataRow[5] || '').trim()
      const slug = String(dataRow[6] || '').trim()
      const pos = Number(dataRow[7]) || 1

      let isActive = true
      const isActiveValue = dataRow[8]
      if (
        isActiveValue !== undefined &&
        isActiveValue !== null &&
        isActiveValue !== ''
      ) {
        if (typeof isActiveValue === 'boolean') {
          isActive = isActiveValue
        } else {
          const isActiveStr = String(isActiveValue).trim().toLowerCase()
          isActive = isActiveStr === 'true' || isActiveStr === '1'
        }
      }

      if (!title || !topicTitle || !levelTitle || !typeTitle || !content) {
        throw new Error(
          `Sheet "${worksheet.name}": Thiếu thông tin bắt buộc (TITLE, TOPIC, LEVEL, TYPE, CONTENT)`
        )
      }

      const topicId = topicTitleToIdMap.get(topicTitle)
      const levelId = levelTitleToIdMap.get(levelTitle)
      const typeId = typeTitleToIdMap.get(typeTitle)

      if (!topicId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy chủ đề "${topicTitle}" trong bảng lookup`
        )
      }

      if (!levelId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy cấp độ "${levelTitle}" trong bảng lookup`
        )
      }

      if (!typeId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy loại "${typeTitle}" trong bảng lookup`
        )
      }

      if (!ObjectId.isValid(topicId)) {
        throw new Error(
          `Sheet "${worksheet.name}": TOPIC_ID không hợp lệ: ${topicId}`
        )
      }

      if (!ObjectId.isValid(levelId)) {
        throw new Error(
          `Sheet "${worksheet.name}": LEVEL_ID không hợp lệ: ${levelId}`
        )
      }

      if (!ObjectId.isValid(typeId)) {
        throw new Error(
          `Sheet "${worksheet.name}": TYPE_ID không hợp lệ: ${typeId}`
        )
      }

      const hints: VocabularyHintType[] = []

      for (let i = 4; i <= rows.length; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const hintVocabEn = String(row[1] || '').trim()
        const hintTranslate = String(row[2] || '').trim()
        const hintTypeLabel = String(row[3] || '').trim()
        const hintExampleEn = String(row[4] || '').trim()
        const hintExampleVi = String(row[5] || '').trim()

        if (hintVocabEn === 'VOCAB_EN' || hintVocabEn === '') {
          continue
        }

        if (hintVocabEn && hintTranslate && hintTypeLabel) {
          const hintTypeValue =
            partOfSpeechLabelToValueMap.get(hintTypeLabel) || hintTypeLabel

          const hint: VocabularyHintType = {
            vocabulary_en: hintVocabEn,
            translate: hintTranslate,
            type: hintTypeValue as PartOfSpeech,
            sentence_example:
              hintExampleEn && hintExampleVi
                ? {
                    en: hintExampleEn,
                    vi: hintExampleVi
                  }
                : undefined
          }
          hints.push(hint)
        }
      }

      const wpParagraph = new WPParagraph({
        title,
        topic: new ObjectId(topicId),
        level: new ObjectId(levelId),
        type: new ObjectId(typeId),
        content,
        hint: hints,
        slug: slug || undefined,
        pos,
        isActive
      })

      wpParagraphs.push(wpParagraph)
    })

    return wpParagraphs
  }

  async createSSTemplate(): Promise<Buffer | ArrayBuffer> {
    const workbook = new ExcelJS.Workbook()

    const setupSheet = workbook.addWorksheet('SETUP')

    const topics = await categoriesServices.getTopics()
    const levels = await categoriesServices.getLevels()

    setupSheet.getCell('A1').value = 'TOPIC_ID'
    setupSheet.getCell('B1').value = 'TOPIC_TITLE'
    topics.forEach((topic, index) => {
      setupSheet.getCell(`A${index + 2}`).value = topic._id?.toString() || ''
      setupSheet.getCell(`B${index + 2}`).value = topic.title || ''
    })

    setupSheet.getCell('D1').value = 'LEVEL_ID'
    setupSheet.getCell('E1').value = 'LEVEL_TITLE'
    levels.forEach((level, index) => {
      setupSheet.getCell(`D${index + 2}`).value = level._id?.toString() || ''
      setupSheet.getCell(`E${index + 2}`).value = level.title || ''
    })

    setupSheet.getRow(1).font = { bold: true }
    setupSheet.columns.forEach((col) => {
      col.width = 20
    })
    setupSheet.state = 'hidden'

    const worksheet = workbook.addWorksheet('Template')

    worksheet.addRow(['TITLE', 'TOPIC', 'LEVEL', 'SLUG', 'POS', 'IS_ACTIVE'])
    worksheet.addRow([
      'Chào hỏi cơ bản',
      topics[0]?.title || '',
      levels[0]?.title || '',
      'chao-hoi-co-ban',
      '1',
      'true'
    ])

    worksheet.addRow([])

    worksheet.addRow([
      'SENTENCE_POS',
      'SENTENCE_EN',
      'SENTENCE_VI',
      'PHONETICS',
      'AUDIO_URL'
    ])

    worksheet.addRow([
      '1',
      'Hello, how are you?',
      'Xin chào, bạn khỏe không?',
      '/həˈloʊ haʊ ɑr ju/',
      'https://example.com/audio/hello.mp3'
    ])

    worksheet.addRow([
      '2',
      'What is your name?',
      'Tên bạn là gì?',
      '/wʌt ɪz jʊr neɪm/',
      'https://example.com/audio/what-name.mp3'
    ])

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(4).font = { bold: true }

    const topicRange = `SETUP!$B$2:$B$${topics.length + 1}`
    worksheet.getCell('B2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [topicRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách chủ đề'
    }

    const levelRange = `SETUP!$E$2:$E$${levels.length + 1}`
    worksheet.getCell('C2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [levelRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách cấp độ'
    }

    worksheet.columns.forEach((column) => {
      column.width = 20
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  async importSSList(fileBuffer: Buffer | ArrayBuffer): Promise<SSList[]> {
    const workbook = new ExcelJS.Workbook()
    let buffer: Buffer
    if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer
    } else {
      buffer = Buffer.from(new Uint8Array(fileBuffer as ArrayBuffer))
    }
    await workbook.xlsx.load(buffer as any)

    const ssLists: SSList[] = []

    const setupSheet = workbook.getWorksheet('SETUP')
    if (!setupSheet) {
      throw new Error('Không tìm thấy sheet SETUP trong file Excel')
    }

    const topicIdToTitleMap = new Map<string, string>()
    const topicTitleToIdMap = new Map<string, string>()
    const levelIdToTitleMap = new Map<string, string>()
    const levelTitleToIdMap = new Map<string, string>()

    let row = 2
    while (setupSheet.getCell(`A${row}`).value) {
      const topicId = String(setupSheet.getCell(`A${row}`).value || '').trim()
      const topicTitle = String(
        setupSheet.getCell(`B${row}`).value || ''
      ).trim()
      if (topicId && topicTitle) {
        topicIdToTitleMap.set(topicId, topicTitle)
        topicTitleToIdMap.set(topicTitle, topicId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`D${row}`).value) {
      const levelId = String(setupSheet.getCell(`D${row}`).value || '').trim()
      const levelTitle = String(
        setupSheet.getCell(`E${row}`).value || ''
      ).trim()
      if (levelId && levelTitle) {
        levelIdToTitleMap.set(levelId, levelTitle)
        levelTitleToIdMap.set(levelTitle, levelId)
      }
      row++
    }

    workbook.eachSheet((worksheet) => {
      if (worksheet.name === 'SETUP') {
        return
      }

      const rows = worksheet.getSheetValues() as any[][]
      if (rows.length < 5) {
        return
      }

      const headerRow = rows[1] || []
      const dataRow = rows[2] || []

      if (
        headerRow[1] !== 'TITLE' ||
        headerRow[2] !== 'TOPIC' ||
        headerRow[3] !== 'LEVEL'
      ) {
        throw new Error(
          `Sheet "${worksheet.name}": Định dạng file không đúng. Vui lòng sử dụng file template mới nhất.`
        )
      }

      const title = String(dataRow[1] || '').trim()
      const topicTitle = String(dataRow[2] || '').trim()
      const levelTitle = String(dataRow[3] || '').trim()
      const slug = String(dataRow[4] || '').trim()
      const pos = Number(dataRow[5]) || 1

      let isActive = true
      const isActiveValue = dataRow[6]
      if (
        isActiveValue !== undefined &&
        isActiveValue !== null &&
        isActiveValue !== ''
      ) {
        if (typeof isActiveValue === 'boolean') {
          isActive = isActiveValue
        } else {
          const isActiveStr = String(isActiveValue).trim().toLowerCase()
          isActive = isActiveStr === 'true' || isActiveStr === '1'
        }
      }

      if (!title || !topicTitle || !levelTitle) {
        throw new Error(
          `Sheet "${worksheet.name}": Thiếu thông tin bắt buộc (TITLE, TOPIC, LEVEL)`
        )
      }

      const topicId = topicTitleToIdMap.get(topicTitle)
      const levelId = levelTitleToIdMap.get(levelTitle)

      if (!topicId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy chủ đề "${topicTitle}" trong bảng lookup`
        )
      }

      if (!levelId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy cấp độ "${levelTitle}" trong bảng lookup`
        )
      }

      if (!ObjectId.isValid(topicId)) {
        throw new Error(
          `Sheet "${worksheet.name}": TOPIC_ID không hợp lệ: ${topicId}`
        )
      }

      if (!ObjectId.isValid(levelId)) {
        throw new Error(
          `Sheet "${worksheet.name}": LEVEL_ID không hợp lệ: ${levelId}`
        )
      }

      const sentences: SentenceSpeakingType[] = []

      for (let i = 5; i <= rows.length; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const sentencePos = Number(row[1] || 0)
        const sentenceEn = String(row[2] || '').trim()
        const sentenceVi = String(row[3] || '').trim()
        const phonetics = String(row[4] || '').trim()
        const audioUrl = String(row[5] || '').trim()

        if (!sentenceEn || !sentenceVi) continue

        sentences.push({
          pos: sentencePos,
          enSentence: sentenceEn,
          viSentence: sentenceVi,
          phonetics: phonetics || '',
          audioUrl: audioUrl || ''
        })
      }

      const list = sentences.sort((a, b) => a.pos - b.pos)

      if (list.length === 0) {
        throw new Error(
          `Sheet "${worksheet.name}": Không có câu nào trong danh sách`
        )
      }

      const ssList = new SSList({
        title,
        topic: new ObjectId(topicId),
        level: new ObjectId(levelId),
        slug: slug || undefined,
        pos,
        isActive,
        list
      })

      ssLists.push(ssList)
    })

    return ssLists
  }

  async createSVTemplate(): Promise<Buffer | ArrayBuffer> {
    const workbook = new ExcelJS.Workbook()

    const setupSheet = workbook.addWorksheet('SETUP')

    const topics = await categoriesServices.getTopics()
    const levels = await categoriesServices.getLevels()

    setupSheet.getCell('A1').value = 'TOPIC_ID'
    setupSheet.getCell('B1').value = 'TOPIC_TITLE'
    topics.forEach((topic, index) => {
      setupSheet.getCell(`A${index + 2}`).value = topic._id?.toString() || ''
      setupSheet.getCell(`B${index + 2}`).value = topic.title || ''
    })

    setupSheet.getCell('D1').value = 'LEVEL_ID'
    setupSheet.getCell('E1').value = 'LEVEL_TITLE'
    levels.forEach((level, index) => {
      setupSheet.getCell(`D${index + 2}`).value = level._id?.toString() || ''
      setupSheet.getCell(`E${index + 2}`).value = level.title || ''
    })

    setupSheet.getRow(1).font = { bold: true }
    setupSheet.columns.forEach((col) => {
      col.width = 20
    })
    setupSheet.state = 'hidden'

    const worksheet = workbook.addWorksheet('Template')

    worksheet.addRow([
      'TITLE',
      'TOPIC',
      'LEVEL',
      'VIDEO_URL',
      'THUMBNAIL_URL',
      'SLUG',
      'POS',
      'IS_ACTIVE'
    ])
    worksheet.addRow([
      'Chào hỏi cơ bản',
      topics[0]?.title || '',
      levels[0]?.title || '',
      'https://www.youtube.com/watch?v=plwLFvq0kkE&list=PLqYGyORvIQix3PW83B284EwtxaQaZaa2a&index=2',
      '',
      'chao-hoi-co-ban',
      '1',
      'true'
    ])

    worksheet.addRow([])

    worksheet.addRow([
      'START_TIME',
      'END_TIME',
      'EN_TEXT',
      'VI_TEXT',
      'PHONETICS'
    ])

    worksheet.addRow([
      '0',
      '5',
      'Hello, how are you?',
      'Xin chào, bạn khỏe không?',
      '/həˈloʊ haʊ ɑr ju/'
    ])

    worksheet.addRow([
      '5',
      '10',
      'What is your name?',
      'Tên bạn là gì?',
      '/wʌt ɪz jʊr neɪm/'
    ])

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(4).font = { bold: true }

    const topicRange = `SETUP!$B$2:$B$${topics.length + 1}`
    worksheet.getCell('B2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [topicRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách chủ đề'
    }

    const levelRange = `SETUP!$E$2:$E$${levels.length + 1}`
    worksheet.getCell('C2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [levelRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách cấp độ'
    }

    worksheet.columns.forEach((column) => {
      column.width = 20
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  async importSVList(fileBuffer: Buffer | ArrayBuffer): Promise<SVShadowing[]> {
    const workbook = new ExcelJS.Workbook()
    let buffer: Buffer
    if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer
    } else {
      buffer = Buffer.from(new Uint8Array(fileBuffer as ArrayBuffer))
    }
    await workbook.xlsx.load(buffer as any)

    const svShadowings: SVShadowing[] = []

    const setupSheet = workbook.getWorksheet('SETUP')
    if (!setupSheet) {
      throw new Error('Không tìm thấy sheet SETUP trong file Excel')
    }

    const topicIdToTitleMap = new Map<string, string>()
    const topicTitleToIdMap = new Map<string, string>()
    const levelIdToTitleMap = new Map<string, string>()
    const levelTitleToIdMap = new Map<string, string>()

    let row = 2
    while (setupSheet.getCell(`A${row}`).value) {
      const topicId = String(setupSheet.getCell(`A${row}`).value || '').trim()
      const topicTitle = String(
        setupSheet.getCell(`B${row}`).value || ''
      ).trim()
      if (topicId && topicTitle) {
        topicIdToTitleMap.set(topicId, topicTitle)
        topicTitleToIdMap.set(topicTitle, topicId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`D${row}`).value) {
      const levelId = String(setupSheet.getCell(`D${row}`).value || '').trim()
      const levelTitle = String(
        setupSheet.getCell(`E${row}`).value || ''
      ).trim()
      if (levelId && levelTitle) {
        levelIdToTitleMap.set(levelId, levelTitle)
        levelTitleToIdMap.set(levelTitle, levelId)
      }
      row++
    }

    workbook.eachSheet((worksheet) => {
      if (worksheet.name === 'SETUP') {
        return
      }

      const rows = worksheet.getSheetValues() as any[][]
      if (rows.length < 5) {
        return
      }

      const headerRow = rows[1] || []
      const dataRow = rows[2] || []

      if (
        headerRow[1] !== 'TITLE' ||
        headerRow[2] !== 'TOPIC' ||
        headerRow[3] !== 'LEVEL' ||
        headerRow[4] !== 'VIDEO_URL'
      ) {
        throw new Error(
          `Sheet "${worksheet.name}": Định dạng file không đúng. Vui lòng sử dụng file template mới nhất.`
        )
      }

      const title = String(dataRow[1] || '').trim()
      const topicTitle = String(dataRow[2] || '').trim()
      const levelTitle = String(dataRow[3] || '').trim()
      const videoUrlRaw = this.extractUrlFromCell(dataRow[4])
      const videoUrl = normalizeYouTubeUrl(videoUrlRaw)
      const thumbnailUrlRaw = this.extractUrlFromCell(dataRow[5])
      const thumbnailUrl = thumbnailUrlRaw ? thumbnailUrlRaw.trim() : ''
      const slug = String(dataRow[6] || '').trim()
      const pos = Number(dataRow[7]) || 1

      let isActive = true
      const isActiveValue = dataRow[8]
      if (
        isActiveValue !== undefined &&
        isActiveValue !== null &&
        isActiveValue !== ''
      ) {
        if (typeof isActiveValue === 'boolean') {
          isActive = isActiveValue
        } else {
          const isActiveStr = String(isActiveValue).trim().toLowerCase()
          isActive = isActiveStr === 'true' || isActiveStr === '1'
        }
      }

      if (!title || !topicTitle || !levelTitle || !videoUrl) {
        throw new Error(
          `Sheet "${worksheet.name}": Thiếu thông tin bắt buộc (TITLE, TOPIC, LEVEL, VIDEO_URL)`
        )
      }

      const topicId = topicTitleToIdMap.get(topicTitle)
      const levelId = levelTitleToIdMap.get(levelTitle)

      if (!topicId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy chủ đề "${topicTitle}" trong bảng lookup`
        )
      }

      if (!levelId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy cấp độ "${levelTitle}" trong bảng lookup`
        )
      }

      if (!ObjectId.isValid(topicId)) {
        throw new Error(
          `Sheet "${worksheet.name}": TOPIC_ID không hợp lệ: ${topicId}`
        )
      }

      if (!ObjectId.isValid(levelId)) {
        throw new Error(
          `Sheet "${worksheet.name}": LEVEL_ID không hợp lệ: ${levelId}`
        )
      }

      const transcript: ShadowingSentenceType[] = []

      function parseTimeToSeconds(timeValue: any): number {
        if (typeof timeValue === 'number') {
          return timeValue
        }
        const timeStr = String(timeValue || '').trim()
        if (!timeStr) return 0

        if (timeStr.includes(':')) {
          const parts = timeStr.split(':')
          if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10) || 0
            const seconds = parseFloat(parts[1]) || 0
            return minutes * 60 + seconds
          }
        }

        const numValue = parseFloat(timeStr)
        return isNaN(numValue) ? 0 : numValue
      }

      for (let i = 4; i <= rows.length; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const startTimeValue = row[1]
        const endTimeValue = row[2]
        const enText = String(row[3] || '').trim()
        const viText = String(row[4] || '').trim()
        const phonetics = String(row[5] || '').trim()

        if (enText === 'EN_TEXT' || enText === 'START_TIME' || enText === '') {
          continue
        }

        if (enText && viText) {
          const startTime = parseTimeToSeconds(startTimeValue)
          const endTime = parseTimeToSeconds(endTimeValue)

          transcript.push({
            startTime: startTime,
            endTime: endTime,
            enText: enText,
            viText: viText,
            phonetics: phonetics || ''
          })
        }
      }

      if (transcript.length === 0) {
        throw new Error(
          `Sheet "${worksheet.name}": Không có câu transcript nào`
        )
      }

      let finalThumbnailUrl = thumbnailUrl || undefined
      if (!finalThumbnailUrl && videoUrl) {
        finalThumbnailUrl = this.generateYouTubeThumbnailUrl(videoUrl)
      }

      const svShadowing = new SVShadowing({
        title,
        topic: new ObjectId(topicId),
        level: new ObjectId(levelId),
        videoUrl,
        thumbnailUrl: finalThumbnailUrl,
        transcript,
        slug: slug || undefined,
        pos,
        isActive
      })

      svShadowings.push(svShadowing)
    })

    return svShadowings
  }

  async createLVTemplate(): Promise<Buffer | ArrayBuffer> {
    const workbook = new ExcelJS.Workbook()

    const setupSheet = workbook.addWorksheet('SETUP')

    const topics = await categoriesServices.getTopics()
    const levels = await categoriesServices.getLevels()

    setupSheet.getCell('A1').value = 'TOPIC_ID'
    setupSheet.getCell('B1').value = 'TOPIC_TITLE'
    topics.forEach((topic, index) => {
      setupSheet.getCell(`A${index + 2}`).value = topic._id?.toString() || ''
      setupSheet.getCell(`B${index + 2}`).value = topic.title || ''
    })

    setupSheet.getCell('D1').value = 'LEVEL_ID'
    setupSheet.getCell('E1').value = 'LEVEL_TITLE'
    levels.forEach((level, index) => {
      setupSheet.getCell(`D${index + 2}`).value = level._id?.toString() || ''
      setupSheet.getCell(`E${index + 2}`).value = level.title || ''
    })

    setupSheet.getRow(1).font = { bold: true }
    setupSheet.columns.forEach((col) => {
      col.width = 20
    })
    setupSheet.state = 'hidden'

    const worksheet = workbook.addWorksheet('Template')

    worksheet.addRow([
      'TITLE',
      'LEVEL',
      'TOPICS',
      'VIDEO_URL',
      'THUMBNAIL_URL',
      'TIME',
      'DESCRIPTION',
      'SLUG',
      'POS',
      'IS_ACTIVE'
    ])
    worksheet.addRow([
      'Bài nghe về chào hỏi',
      levels[0]?.title || '',
      topics[0]?.title || '',
      'https://www.youtube.com/watch?v=VIDEO_ID',
      '',
      '5',
      'Bài nghe về cách chào hỏi cơ bản',
      'bai-nghe-ve-chao-hoi',
      '1',
      'true'
    ])

    worksheet.addRow([])

    worksheet.addRow([
      'TRANSCRIPT_POS',
      'START_TIME',
      'END_TIME',
      'EN_TEXT',
      'VI_TEXT'
    ])

    worksheet.addRow([
      '1',
      '0',
      '5',
      'Hello, how are you?',
      'Xin chào, bạn khỏe không?'
    ])

    worksheet.addRow(['2', '5', '10', 'What is your name?', 'Tên bạn là gì?'])

    worksheet.addRow([])

    worksheet.addRow([
      'QUESTION_POS',
      'QUESTION',
      'OPTION_A',
      'OPTION_B',
      'OPTION_C',
      'OPTION_D',
      'ANSWER',
      'EXPLANATION'
    ])

    worksheet.addRow([
      '1',
      'What did the person say?',
      'Hello',
      'Goodbye',
      'Thank you',
      'Please',
      'A',
      'The person said hello'
    ])

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(4).font = { bold: true }
    worksheet.getRow(8).font = { bold: true }

    const levelRange = `SETUP!$E$2:$E$${levels.length + 1}`
    worksheet.getCell('B2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [levelRange],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Lỗi',
      error: 'Vui lòng chọn từ danh sách cấp độ'
    }

    worksheet.columns.forEach((column) => {
      column.width = 20
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  async importLVList(
    fileBuffer: Buffer | ArrayBuffer
  ): Promise<ListeningVideo[]> {
    const workbook = new ExcelJS.Workbook()
    let buffer: Buffer
    if (Buffer.isBuffer(fileBuffer)) {
      buffer = fileBuffer
    } else {
      buffer = Buffer.from(new Uint8Array(fileBuffer as ArrayBuffer))
    }
    await workbook.xlsx.load(buffer as any)

    const listeningVideos: ListeningVideo[] = []

    const setupSheet = workbook.getWorksheet('SETUP')
    if (!setupSheet) {
      throw new Error('Không tìm thấy sheet SETUP trong file Excel')
    }

    const topicIdToTitleMap = new Map<string, string>()
    const topicTitleToIdMap = new Map<string, string>()
    const levelIdToTitleMap = new Map<string, string>()
    const levelTitleToIdMap = new Map<string, string>()

    let row = 2
    while (setupSheet.getCell(`A${row}`).value) {
      const topicId = String(setupSheet.getCell(`A${row}`).value || '').trim()
      const topicTitle = String(
        setupSheet.getCell(`B${row}`).value || ''
      ).trim()
      if (topicId && topicTitle) {
        topicIdToTitleMap.set(topicId, topicTitle)
        topicTitleToIdMap.set(topicTitle, topicId)
      }
      row++
    }

    row = 2
    while (setupSheet.getCell(`D${row}`).value) {
      const levelId = String(setupSheet.getCell(`D${row}`).value || '').trim()
      const levelTitle = String(
        setupSheet.getCell(`E${row}`).value || ''
      ).trim()
      if (levelId && levelTitle) {
        levelIdToTitleMap.set(levelId, levelTitle)
        levelTitleToIdMap.set(levelTitle, levelId)
      }
      row++
    }

    workbook.eachSheet((worksheet) => {
      if (worksheet.name === 'SETUP') {
        return
      }

      const rows = worksheet.getSheetValues() as any[][]
      if (rows.length < 8) {
        return
      }

      const headerRow = rows[1] || []
      const dataRow = rows[2] || []

      if (
        headerRow[1] !== 'TITLE' ||
        headerRow[2] !== 'LEVEL' ||
        headerRow[3] !== 'TOPICS' ||
        headerRow[4] !== 'VIDEO_URL'
      ) {
        throw new Error(
          `Sheet "${worksheet.name}": Định dạng file không đúng. Vui lòng sử dụng file template mới nhất.`
        )
      }

      const title = String(dataRow[1] || '').trim()
      const levelTitle = String(dataRow[2] || '').trim()
      const topicsStr = String(dataRow[3] || '').trim()
      const videoUrlRaw = this.extractUrlFromCell(dataRow[4])
      const videoUrl = normalizeYouTubeUrl(videoUrlRaw)
      const thumbnailUrlRaw = this.extractUrlFromCell(dataRow[5])
      const thumbnailUrl = thumbnailUrlRaw ? thumbnailUrlRaw.trim() : ''
      const time = dataRow[6] ? Number(dataRow[6]) : undefined
      const description = String(dataRow[7] || '').trim() || undefined
      const slug = String(dataRow[8] || '').trim()
      const pos = Number(dataRow[9]) || 1

      let isActive = true
      const isActiveValue = dataRow[10]
      if (
        isActiveValue !== undefined &&
        isActiveValue !== null &&
        isActiveValue !== ''
      ) {
        if (typeof isActiveValue === 'boolean') {
          isActive = isActiveValue
        } else {
          const isActiveStr = String(isActiveValue).trim().toLowerCase()
          isActive = isActiveStr === 'true' || isActiveStr === '1'
        }
      }

      if (!title || !levelTitle || !topicsStr || !videoUrl) {
        throw new Error(
          `Sheet "${worksheet.name}": Thiếu thông tin bắt buộc (TITLE, LEVEL, TOPICS, VIDEO_URL)`
        )
      }

      const levelId = levelTitleToIdMap.get(levelTitle)
      if (!levelId) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy cấp độ "${levelTitle}" trong bảng lookup`
        )
      }

      if (!ObjectId.isValid(levelId)) {
        throw new Error(
          `Sheet "${worksheet.name}": LEVEL_ID không hợp lệ: ${levelId}`
        )
      }

      const topicsArray = topicsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const topicIds: ObjectId[] = []
      for (const topicTitle of topicsArray) {
        const topicId = topicTitleToIdMap.get(topicTitle)
        if (!topicId) {
          throw new Error(
            `Sheet "${worksheet.name}": Không tìm thấy chủ đề "${topicTitle}" trong bảng lookup`
          )
        }
        if (!ObjectId.isValid(topicId)) {
          throw new Error(
            `Sheet "${worksheet.name}": TOPIC_ID không hợp lệ: ${topicId}`
          )
        }
        topicIds.push(new ObjectId(topicId))
      }

      if (topicIds.length === 0) {
        throw new Error(`Sheet "${worksheet.name}": Phải có ít nhất một chủ đề`)
      }

      function parseTimeToSeconds(timeValue: any): number {
        if (typeof timeValue === 'number') {
          return timeValue
        }
        const timeStr = String(timeValue || '').trim()
        if (!timeStr) return 0

        if (timeStr.includes(':')) {
          const parts = timeStr.split(':')
          if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10) || 0
            const seconds = parseFloat(parts[1]) || 0
            return minutes * 60 + seconds
          }
        }

        const numValue = parseFloat(timeStr)
        return isNaN(numValue) ? 0 : numValue
      }

      const transcript: TranscriptSentenceType[] = []
      let transcriptHeaderRow = -1
      let questionHeaderRow = -1

      for (let i = 3; i <= rows.length; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const firstCell = String(row[1] || '').trim()
        if (firstCell === 'TRANSCRIPT_POS') {
          transcriptHeaderRow = i
        } else if (firstCell === 'QUESTION_POS') {
          questionHeaderRow = i
          break
        }
      }

      if (transcriptHeaderRow === -1) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy header TRANSCRIPT_POS`
        )
      }

      const transcriptEndRow =
        questionHeaderRow !== -1 ? questionHeaderRow : rows.length + 1

      for (let i = transcriptHeaderRow + 1; i < transcriptEndRow; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const firstCell = String(row[1] || '').trim()
        if (firstCell === 'TRANSCRIPT_POS' || firstCell === 'QUESTION_POS') {
          continue
        }

        const transcriptPos = Number(row[1] || 0)
        const startTimeValue = row[2]
        const endTimeValue = row[3]
        const enText = String(row[4] || '').trim()
        const viText = String(row[5] || '').trim()

        if (!enText) {
          continue
        }

        const startTime = parseTimeToSeconds(startTimeValue)
        const endTime = parseTimeToSeconds(endTimeValue)

        transcript.push({
          pos: transcriptPos || transcript.length + 1,
          startTime: startTime,
          endTime: endTime,
          enText: enText,
          viText: viText || undefined
        })
      }

      if (transcript.length === 0) {
        throw new Error(
          `Sheet "${worksheet.name}": Không có câu transcript nào`
        )
      }

      const questions: QuestionType[] = []

      if (questionHeaderRow === -1) {
        throw new Error(
          `Sheet "${worksheet.name}": Không tìm thấy header QUESTION_POS`
        )
      }

      for (let i = questionHeaderRow + 1; i <= rows.length; i++) {
        const row = rows[i] || []
        if (!row || row.length === 0) continue

        const firstCell = String(row[1] || '').trim()
        if (firstCell === 'QUESTION_POS' || firstCell === 'TRANSCRIPT_POS') {
          continue
        }

        const questionPos = Number(row[1] || 0)
        const question = String(row[2] || '').trim()
        const optionA = String(row[3] || '').trim()
        const optionB = String(row[4] || '').trim()
        const optionC = String(row[5] || '').trim()
        const optionD = String(row[6] || '').trim()
        const answer = String(row[7] || '')
          .trim()
          .toUpperCase()
        const explanation = String(row[8] || '').trim()

        if (
          !question ||
          !optionA ||
          !optionB ||
          !optionC ||
          !optionD ||
          !answer
        ) {
          continue
        }

        if (!['A', 'B', 'C', 'D'].includes(answer)) {
          throw new Error(
            `Sheet "${worksheet.name}": Đáp án đúng phải là A, B, C hoặc D (dòng ${i + 1})`
          )
        }

        questions.push({
          _id: new ObjectId(),
          pos: questionPos || questions.length + 1,
          question: question,
          options: {
            A: optionA,
            B: optionB,
            C: optionC,
            D: optionD
          },
          answer: answer as 'A' | 'B' | 'C' | 'D',
          explanation: explanation || ''
        })
      }

      if (questions.length === 0) {
        throw new Error(`Sheet "${worksheet.name}": Không có câu hỏi nào`)
      }

      let finalThumbnailUrl = thumbnailUrl || undefined
      if (!finalThumbnailUrl && videoUrl) {
        finalThumbnailUrl = this.generateYouTubeThumbnailUrl(videoUrl)
      }

      const listeningVideo = new ListeningVideo({
        title,
        level: new ObjectId(levelId),
        topics: topicIds,
        videoUrl,
        thumbnailUrl: finalThumbnailUrl,
        transcript,
        questions,
        time,
        description,
        slug: slug || undefined,
        pos,
        isActive
      })

      listeningVideos.push(listeningVideo)
    })

    return listeningVideos
  }
}

export default new ExcelService()
