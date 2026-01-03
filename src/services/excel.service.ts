import ExcelJS from 'exceljs'
import { ObjectId } from 'mongodb'
import WSList, { SentenceWriteType } from '~/models/schemas/ws-list.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import { VocabularyHintType } from '~/models/Other'
import { PartOfSpeech } from '~/constants/enum'
import categoriesServices from '~/services/categories.service'

class ExcelService {
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
      const isActive = String(dataRow[6] || 'true').toLowerCase() === 'true'

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
      'My name is John. I am 25 years old. I work as a teacher.',
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
}

export default new ExcelService()
