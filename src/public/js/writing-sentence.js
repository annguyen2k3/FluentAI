import { ApiBreakpoint } from '/js/api_breakpoint.js'

// Write-sentence setup interactions
const wsSetup = document.getElementById('ws-setup')

if (wsSetup) {
  const levelOptions = wsSetup.querySelectorAll('.ws-setup__option')
  const topicButtons = wsSetup.querySelectorAll('.ws-setup__topic')
  const customTopicInput = wsSetup.querySelector('.ws-setup__custom-input')
  const startBtn = wsSetup.querySelector('.ws-setup__start')

  levelOptions.forEach((opt) => {
    opt.addEventListener('click', function () {
      levelOptions.forEach((o) =>
        o.classList.remove('ws-setup__option--active')
      )
      this.classList.add('ws-setup__option--active')
    })
  })

  topicButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      topicButtons.forEach((b) => b.classList.remove('ws-setup__topic--active'))
      this.classList.add('ws-setup__topic--active')
    })
  })

  if (customTopicInput) {
    customTopicInput.addEventListener('focus', function () {
      topicButtons.forEach((b) => b.classList.remove('ws-setup__topic--active'))
    })
  }

  if (startBtn) {
    startBtn.addEventListener('click', function (e) {
      e.preventDefault()
      const levelChoose = wsSetup.querySelector(
        '.ws-setup__option--level[active]'
      )
      const topicChoose = wsSetup.querySelector('.ws-setup__topic[active]')

      if (!levelChoose) {
        alertError('Vui lòng chọn cấp độ')
        return
      }
      if (!topicChoose) {
        alertError('Vui lòng chọn chủ đề')
        return
      }

      const levelSlug = levelChoose.getAttribute('level')
      const topicType = topicChoose.getAttribute('source-topic')

      if (topicType === 'system') {
        window.location.href = `/writing-sentence/system-list?level=${levelSlug}`
      }
      if (topicType === 'custom') {
        const topic = customTopicInput.value || ''
        const level = levelSlug || ''
        const requestUrl = `${ApiBreakpoint.POST_CUSTOM_TOPIC_PREVIEW_WS}`
        fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ topic: topic, level: level })
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === 200) {
              const preview = data.previewResult || {}
              const wsListPreview = data.wsListPreview || {}
              const modalEl = document.getElementById('wsPreviewModal')
              if (!modalEl) return
              modalEl.setAttribute(
                'id-ws-list-preview',
                wsListPreview._id.toString()
              )
              const statusEl = document.getElementById('wsPreviewStatus')
              const descEl = document.getElementById('wsPreviewDescription')
              const countEl = document.getElementById('wsPreviewCount')
              const listEl = document.getElementById('wsPreviewList')
              if (statusEl) {
                statusEl.textContent = preview.passed ? 'Đạt' : 'Chưa đạt'
                statusEl.classList.remove('bg-success', 'bg-danger')
                statusEl.classList.add(
                  preview.passed ? 'bg-success' : 'bg-danger'
                )
              }
              if (descEl) {
                descEl.textContent = preview.description || ''
              }
              if (countEl) {
                countEl.textContent = Array.isArray(preview.list)
                  ? preview.list.length
                  : 0
              }
              if (listEl) {
                listEl.innerHTML = ''
                if (Array.isArray(preview.list)) {
                  preview.list.forEach((item) => {
                    const li = document.createElement('li')
                    li.className = 'list-group-item'
                    li.textContent = item.content || ''
                    listEl.appendChild(li)
                  })
                }
              }
              const regenerateBtn = document.getElementById(
                'wsPreviewRegenerate'
              )
              if (regenerateBtn) {
                regenerateBtn.onclick = () => {
                  const reqUrl = `${ApiBreakpoint.POST_CUSTOM_TOPIC_PREVIEW_WS}`
                  fetch(reqUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Accept: 'application/json'
                    },
                    body: JSON.stringify({ topic: topic, level: level })
                  })
                    .then((r) => r.json())
                    .then((res) => {
                      if (res.status === 200) {
                        const p = res.previewResult || {}
                        if (statusEl) {
                          statusEl.textContent = p.passed ? 'Đạt' : 'Chưa đạt'
                          statusEl.classList.remove('bg-success', 'bg-danger')
                          statusEl.classList.add(
                            p.passed ? 'bg-success' : 'bg-danger'
                          )
                        }
                        if (descEl) descEl.textContent = p.description || ''
                        if (countEl)
                          countEl.textContent = Array.isArray(p.list)
                            ? p.list.length
                            : 0
                        if (listEl) {
                          listEl.innerHTML = ''
                          if (Array.isArray(p.list)) {
                            p.list.forEach((it) => {
                              const li = document.createElement('li')
                              li.className = 'list-group-item'
                              li.textContent = it.content || ''
                              listEl.appendChild(li)
                            })
                          }
                        }
                      } else {
                        alertError(res.message)
                      }
                    })
                    .catch((err) => console.error('Error:', err))
                }
              }
              const startBtn = document.getElementById('wsPreviewStart')
              if (startBtn) {
                startBtn.onclick = () => {
                  const templateUrl = `${ApiBreakpoint.GET_PRACTICE_CUSTOM_TOPIC_WS}`
                  const requestUrl = templateUrl.replace(
                    '{idPreview}',
                    wsListPreview._id.toString()
                  )
                  window.location.href = requestUrl
                }
              }
              const modal =
                typeof bootstrap !== 'undefined'
                  ? new bootstrap.Modal(modalEl)
                  : null
              if (modal) modal.show()
            } else {
              alertError(data.message)
            }
          })
          .catch((error) => console.error('Error:', error))
      }
    })
  }
  // Write-sentence Setup
  const levelWSOptions = wsSetup.querySelectorAll('.ws-setup__option--level')
  const topicWSOptions = wsSetup.querySelectorAll('.ws-setup__topic')
  levelWSOptions.forEach((opt) => {
    opt.addEventListener('click', function () {
      levelWSOptions.forEach((o) => o.removeAttribute('active'))
      this.setAttribute('active', '')
    })
  })
  topicWSOptions.forEach((opt) => {
    opt.addEventListener('click', function () {
      topicWSOptions.forEach((o) => o.removeAttribute('active'))
      this.setAttribute('active', '')
    })
  })
}

// Write-sentence list interactions
const wsListChoose = document.querySelector('div[ws-list-choose]')
if (wsListChoose) {
  let currentPage = 1
  const limit = 10
  let levelId = wsListChoose.getAttribute('level')
  let topicId = wsListChoose.getAttribute('topic') || ''
  let statusId = ''
  const localStatusMap = loadLocalHistoryStatus()

  function escapeHTML(text = '') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function mapStatusToBadge(status) {
    if (!status) return { label: 'Mới', key: 'new' }
    if (status === 'completed')
      return { label: 'Đã hoàn thành', key: 'completed' }
    if (status === 'in_progress')
      return { label: 'Đang tiến hành', key: 'in-progress' }
    return { label: 'Mới', key: 'new' }
  }

  function loadLocalHistoryStatus() {
    const map = {}
    Object.keys(localStorage || {}).forEach((key) => {
      if (!key.startsWith('ws-history-')) return
      const slug = key.replace('ws-history-', '')
      try {
        const items = JSON.parse(localStorage.getItem(key)) || []
        if (Array.isArray(items) && items.length) {
          const allPassed = items.every((it) => it?.passed)
          map[slug] = allPassed ? 'completed' : 'in_progress'
        }
      } catch (error) {
        /* ignore malformed local storage */
      }
    })
    return map
  }

  function renderPagination(pagination) {
    const paginationContainer = document.querySelector('.wp-choose__pagination')
    if (!paginationContainer) return

    const infoEl = paginationContainer.querySelector(
      '.wp-choose__pagination-info'
    )
    const buttonsContainer = paginationContainer.querySelector(
      '.d-flex.align-items-center.gap-2'
    )

    if (!infoEl || !buttonsContainer) return

    const { page, limit, total, totalPages } = pagination
    const startItem = (page - 1) * limit + 1
    const endItem = Math.min(page * limit, total)

    infoEl.innerHTML = `
      <span class="wp-choose__pagination-text">Hiển thị các mục ${startItem}-${endItem} trên tổng số ${total}</span>
    `

    buttonsContainer.innerHTML = ''

    const prevBtn = document.createElement('button')
    prevBtn.className = 'btn btn-light wp-choose__page'
    prevBtn.disabled = !pagination.hasPrevPage
    prevBtn.innerHTML = '<i class="fas fa-angle-left"></i>'
    if (pagination.hasPrevPage) {
      prevBtn.addEventListener('click', () => {
        currentPage = page - 1
        loadWSList(levelId, topicId, statusId, currentPage, limit)
      })
    }
    buttonsContainer.appendChild(prevBtn)

    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      const firstBtn = document.createElement('button')
      firstBtn.className = 'btn btn-outline-primary wp-choose__page'
      firstBtn.textContent = '1'
      firstBtn.addEventListener('click', () => {
        currentPage = 1
        loadWSList(levelId, topicId, statusId, currentPage, limit)
      })
      buttonsContainer.appendChild(firstBtn)

      if (startPage > 2) {
        const ellipsis = document.createElement('button')
        ellipsis.className = 'btn btn-outline-primary wp-choose__page'
        ellipsis.disabled = true
        ellipsis.textContent = '...'
        buttonsContainer.appendChild(ellipsis)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button')
      if (i === page) {
        pageBtn.className = 'btn btn-primary wp-choose__page is-active'
      } else {
        pageBtn.className = 'btn btn-outline-primary wp-choose__page'
      }
      pageBtn.textContent = i
      pageBtn.addEventListener('click', () => {
        currentPage = i
        loadWSList(levelId, topicId, statusId, currentPage, limit)
      })
      buttonsContainer.appendChild(pageBtn)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('button')
        ellipsis.className = 'btn btn-outline-primary wp-choose__page'
        ellipsis.disabled = true
        ellipsis.textContent = '...'
        buttonsContainer.appendChild(ellipsis)
      }

      const lastBtn = document.createElement('button')
      lastBtn.className = 'btn btn-outline-primary wp-choose__page'
      lastBtn.textContent = totalPages
      lastBtn.addEventListener('click', () => {
        currentPage = totalPages
        loadWSList(levelId, topicId, statusId, currentPage, limit)
      })
      buttonsContainer.appendChild(lastBtn)
    }

    const nextBtn = document.createElement('button')
    nextBtn.className = 'btn btn-light wp-choose__page'
    nextBtn.disabled = !pagination.hasNextPage
    nextBtn.innerHTML = '<i class="fas fa-angle-right"></i>'
    if (pagination.hasNextPage) {
      nextBtn.addEventListener('click', () => {
        currentPage = page + 1
        loadWSList(levelId, topicId, statusId, currentPage, limit)
      })
    }
    buttonsContainer.appendChild(nextBtn)
  }

  function loadWSList(level, topic = '', status = '', page = 1, limit = 10) {
    const requestUrl = new URL(ApiBreakpoint.GET_WS_LIST)

    if (level) {
      requestUrl.searchParams.set('level', level)
    }
    if (topic) {
      requestUrl.searchParams.set('topic', topic)
    }
    if (status) {
      requestUrl.searchParams.set('status', status)
    }
    if (page) {
      requestUrl.searchParams.set('page', page)
    }
    if (limit) {
      requestUrl.searchParams.set('limit', limit)
    }

    const wsListCards = document.querySelector('div[ws-list-cards]')
    if (wsListCards) {
      wsListCards.innerHTML =
        '<p class="text-center">Đang tải danh sách câu...</p>'
    }

    fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          const wsList = data.data || []
          const pagination = data.pagination

          if (wsList.length > 0) {
            wsListCards.innerHTML = ''
            wsList.forEach((ws) => {
              const sentenceCount = ws.list ? ws.list.length : 0
              const title = escapeHTML(ws.title || '')
              const topicTitle = ws.topic?.title
                ? escapeHTML(ws.topic.title)
                : 'Chủ đề chung'
              const historyStatus =
                ws.history?.content?.status || ws.history?.status || ''
              const statusValue = historyStatus || ''
              const status = mapStatusToBadge(statusValue)
              const firstSentence =
                ws.list && ws.list[0] ? escapeHTML(ws.list[0].content) : ''

              wsListCards.innerHTML += `
              <div class="col-12 col-lg-6">
                  <div class="wp-choose__card" id-ws=${ws._id.toString()} slug=${ws.slug}>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <h5 class="wp-choose__title m-0" title="${title}">${title}</h5>
                          <span class="wp-choose__badge" data-status="${status.key}">${status.label}</span>
                      </div>
                      <p class="wp-choose__excerpt">${firstSentence}</p>
                      <div class="d-flex flex-wrap gap-3 align-items-center wp-choose__meta">
                          <span><i class="far fa-folder-open me-1"></i>${topicTitle}</span>
                          <span><i class="far fa-list-alt me-1"></i>${sentenceCount} câu</span>
                      </div>
                      <div class="text-end">
                          <a href="/writing-sentence/practice/${ws.slug}" class="btn btn-primary wp-choose__btn">Bắt đầu</a>
                      </div>
                  </div>
              </div>
            `
            })
          } else {
            wsListCards.innerHTML = `
              <p class="text-center">Không có dữ liệu</p>
            `
          }

          if (pagination) {
            renderPagination(pagination)
          }
        } else {
          alertError(data.message)
          if (wsListCards) {
            wsListCards.innerHTML = `
              <p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>
            `
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        if (wsListCards) {
          wsListCards.innerHTML = `
            <p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>
          `
        }
      })
  }

  loadWSList(levelId, topicId, statusId, currentPage, limit)

  const filterTopic = document.querySelector('select[filter-topic]')
  if (filterTopic) {
    filterTopic.addEventListener('change', function () {
      topicId = this.value || ''
      currentPage = 1
      loadWSList(levelId, topicId, statusId, currentPage, limit)
    })
  }

  const filterStatus = document.querySelector('select[filter-status]')
  if (filterStatus) {
    filterStatus.addEventListener('change', function () {
      statusId = this.value || ''
      currentPage = 1
      loadWSList(levelId, topicId, statusId, currentPage, limit)
    })
  }

  const btnRandom = document.querySelector('[btn-random]')
  if (btnRandom) {
    btnRandom.addEventListener('click', function () {
      const levelRandom = wsListChoose.getAttribute('level')
      const topicRandom =
        document.querySelector('select[filter-topic]').value || ''

      const requestUrl = new URL(ApiBreakpoint.GET_RANDOM_WS)
      if (levelRandom) {
        requestUrl.searchParams.set('level', levelRandom)
      }
      if (topicRandom) {
        requestUrl.searchParams.set('topic', topicRandom)
      }
      fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 200) {
            window.location.href = `/writing-sentence/practice/${data.ws.slug}`
          } else {
            alertError(data.message)
          }
        })
        .catch((error) => console.error('Error:', error))
    })
  }
}

// Write-sentence practice interactions
const wsPractice = document.querySelector('[ws-data-practice]')
if (wsPractice) {
  const wsDataEl = document.getElementById('ws-data')
  const hisWSDataEl = document.getElementById('his-ws-data')

  const rawWS = wsDataEl ? wsDataEl.textContent : '{}'
  const rawHisWS = hisWSDataEl ? hisWSDataEl.textContent : '{}'

  let wsData, hisWSData
  try {
    wsData = JSON.parse(rawWS)
  } catch (error) {
    wsData = {}
  }

  try {
    hisWSData = JSON.parse(rawHisWS)
  } catch (error) {
    hisWSData = {}
  }

  const practiceSlug = wsData?.slug || ''
  const practiceHistoryKey = `ws-history-${wsData.slug || wsData._id || 'default'}`
  let practiceHistory = []
  try {
    const stored = localStorage.getItem(practiceHistoryKey)
    practiceHistory = stored ? JSON.parse(stored) || [] : []
  } catch (error) {
    practiceHistory = []
  }

  const feedbackDescription = document.querySelector('[feedback-description]')
  const wsLoadingEl = document.getElementById('ws-loading')
  const buttonSubmit = document.querySelector('[button-submit]')
  const buttonNext = document.querySelector('[button-next]')
  const userTranslationInput = document.querySelector('[user_translation]')

  const listSentences = wsData.list || []

  function getMergedHistorySentences() {
    const base = hisWSData?.content?.sentences || []
    const map = new Map()
    base.forEach((item) => {
      if (item?.sentence_original) {
        map.set(item.sentence_original, item)
      }
    })
    practiceHistory.forEach((item) => {
      if (item?.sentence_original) {
        map.set(item.sentence_original, item)
      }
    })
    return Array.from(map.values())
  }

  function getInitialIndex() {
    const merged = getMergedHistorySentences()
    for (let i = 0; i < listSentences.length; i++) {
      const s = listSentences[i]
      const hist = merged.find(
        (h) => h.sentence_original === s.content && h.passed === true
      )
      if (!hist) {
        return i + 1
      }
    }
    return listSentences.length > 0 ? listSentences.length : 1
  }

  function isAllCompleted() {
    const merged = getMergedHistorySentences()
    if (!listSentences.length) return false
    return listSentences.every((s) =>
      merged.some((h) => h.sentence_original === s.content && h.passed)
    )
  }

  const allCompleted = isAllCompleted()
  let currentIndex = getInitialIndex()

  function renderSentence(index) {
    if (allCompleted) {
      const sentenceContent = document.querySelector('[sentence_vi]')
      if (sentenceContent) {
        sentenceContent.textContent =
          'Bạn đã hoàn thành xuất sắc bài luyện tập này. Nếu muốn luyện tập lại hãy xoá lịch sử và bắt đầu lại.'
      }
      const progressIndex = document.querySelector('[progress-index]')
      if (progressIndex) {
        progressIndex.textContent = listSentences.length
      }
      const progressFill = document.querySelector('[progress-fill]')
      if (progressFill) {
        progressFill.style.width = '100%'
      }
      if (buttonSubmit) {
        buttonSubmit.disabled = true
      }
      if (buttonNext) {
        buttonNext.classList.add('d-none')
      }
      return
    }

    const sentence = listSentences[index - 1]
    if (sentence) {
      console.log(sentence)
      const sentenceContent = document.querySelector('[sentence_vi]')
      sentenceContent.textContent = sentence.content

      const progressIndex = document.querySelector('[progress-index]')
      progressIndex.textContent = index
      const progressFill = document.querySelector('[progress-fill]')
      progressFill.style.width = `${(index / listSentences.length) * 100}%`

      const hintModal = document.querySelector('[data-hint-items]')
      if (hintModal) {
        hintModal.innerHTML = ''
        sentence.hint.forEach((hint) => {
          hintModal.innerHTML += `
            <div class="hint-modal__item">
              <div class="hint-modal__item-content">
                  <div class="hint-modal__hint-text">${hint.vocabulary_en}</div>
                  <div class="hint-modal__hint-tag">${hint.type}</div>
              </div>
              <div class="hint-modal__item-details">
                  <div class="hint-modal__meaning">
                      <span class="hint-modal__label">Nghĩa:</span>
                      <span class="hint-modal__vietnamese">${hint.translate}</span>
                  </div>
                  <div class="hint-modal__example">
                      <span class="hint-modal__label">Ví dụ:</span><br>
                      <span class="hint-modal__example-text">
                          - ${hint.sentence_example.en} <br>
                          - ${hint.sentence_example.vi}
                      </span>
                  </div>
              </div>
            </div>
          `
        })
      }
    }
  }

  function renderFeedback(evaluateResult) {
    const tagClass = evaluateResult.passed
      ? 'ws-feedback__tag--passed'
      : 'ws-feedback__tag--failed'
    const tagIcon = evaluateResult.passed
      ? 'fa-circle-check'
      : 'fa-circle-xmark'
    const tagText = evaluateResult.passed ? 'Đạt' : 'Chưa đạt'

    const sections = []

    sections.push(`
      <div class="ws-feedback__tag ${tagClass}">
        <i class="fa-solid ${tagIcon}"></i>
        <span>${tagText}</span>
      </div>
    `)

    const sentenceHtml = renderSentenceTokens(evaluateResult.tokens)
    if (sentenceHtml) {
      sections.push(`
        <p class="ws-feedback__sentence">
          <span class="letter-pink">Câu gợi ý:</span>
          ${sentenceHtml}
        </p>
      `)
    }

    if (
      Array.isArray(evaluateResult.suggested_improvements) &&
      evaluateResult.suggested_improvements.length
    ) {
      const improvements = evaluateResult.suggested_improvements
        .map((item) => `<li>${formatHighlight(item)}</li>`)
        .join('')
      sections.push(`
        <div class="ws-feedback__section">
          <p class="ws-feedback__title letter-pink mb-1">Đề xuất cải thiện</p>
          <ul class="ws-feedback__list">${improvements}</ul>
        </div>
      `)
    }

    if (evaluateResult.general_feedback) {
      sections.push(`
        <p class="ws-feedback__note">
          <span class="letter-correct">Nhận xét:</span>
          ${formatHighlight(evaluateResult.general_feedback)}
        </p>
      `)
    }

    return sections.join('')
  }

  function saveClientHistory(evaluateResult) {
    if (!evaluateResult || !evaluateResult.sentence_original) return
    const idx = practiceHistory.findIndex(
      (item) => item.sentence_original === evaluateResult.sentence_original
    )
    if (idx >= 0) {
      practiceHistory[idx] = evaluateResult
    } else {
      practiceHistory.push(evaluateResult)
    }
    try {
      localStorage.setItem(practiceHistoryKey, JSON.stringify(practiceHistory))
    } catch (error) {
      /* ignore storage errors */
    }
  }

  renderSentence(currentIndex)

  const buttonQuit = document.querySelector('[button-quit]')
  if (buttonQuit) {
    buttonQuit.addEventListener('click', function (e) {
      e.preventDefault()
      window.location.href = `/writing-sentence/system-list?level=${wsData.level.slug}`
    })
  }

  buttonNext.addEventListener('click', function () {
    currentIndex++
    const isLast = currentIndex > listSentences.length
    if (isLast) {
      if (practiceSlug) {
        window.location.href = `/writing-sentence/practice/complete/${practiceSlug}`
      }
      return
    }
    renderSentence(currentIndex)
    buttonNext.classList.add('d-none')
    buttonSubmit.classList.remove('d-none')
    if (userTranslationInput) {
      userTranslationInput.value = ''
      userTranslationInput.disabled = false
    }
    if (wsLoadingEl) {
      wsLoadingEl.style.display = 'none'
    }
    if (feedbackDescription) {
      feedbackDescription.style.display = 'block'
      feedbackDescription.innerHTML =
        'Click <span class="letter-highlight">Submit</span> to get feedback from <span class="letter-highlight">AI</span>. The system will review your translation and point out its strengths and areas for improvement.'
    }
  })

  if (buttonSubmit) {
    buttonSubmit.addEventListener('click', function () {
      const sentenceVi =
        document.querySelector('[sentence_vi]').textContent || ''
      const userTranslation =
        document.querySelector('[user_translation]').value || ''
      console.log(sentenceVi)
      console.log(userTranslation)
      if (!userTranslation) {
        alertError('Vui lòng nhập bản dịch của bạn')
        return
      }

      if (wsLoadingEl) {
        wsLoadingEl.style.display = 'flex'
      }
      if (feedbackDescription) {
        feedbackDescription.style.display = 'none'
      }
      buttonSubmit.disabled = true

      if (!practiceSlug) {
        alertError('Không tìm thấy mã bài luyện tập')
        buttonSubmit.disabled = false
        return
      }

      const requestUrl = `${ApiBreakpoint.POST_PRACTICE_WS}/${practiceSlug}`
      fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          sentence_vi: sentenceVi,
          user_translation: userTranslation
        })
      })
        .then((response) => response.json())
        .then((data) => {
          if (wsLoadingEl) {
            wsLoadingEl.style.display = 'none'
          }
          if (feedbackDescription) {
            feedbackDescription.style.display = 'block'
          }
          buttonSubmit.disabled = false

          if (data.status === 200) {
            console.log(data.evaluateResult)
            feedbackDescription.innerHTML = renderFeedback(data.evaluateResult)
            if (userTranslationInput) {
              userTranslationInput.value = ''
            }
            if (data.evaluateResult.passed) {
              saveClientHistory(data.evaluateResult)
              renderHistoryList()
              if (userTranslationInput) {
                userTranslationInput.disabled = true
              }
              if (currentIndex === listSentences.length) {
                const loadingOverlay = document.getElementById(
                  'practice-complete-loading'
                )
                if (loadingOverlay) {
                  loadingOverlay.style.display = 'flex'
                }
                if (practiceSlug) {
                  setTimeout(() => {
                    window.location.href = `/writing-sentence/practice/complete/${practiceSlug}`
                  }, 300)
                }
              } else {
                buttonNext.classList.remove('d-none')
                buttonSubmit.classList.add('d-none')
              }
            } else {
              buttonNext.classList.add('d-none')
              buttonSubmit.classList.remove('d-none')
            }
          } else {
            console.log(data)
            alertError(data.message)
          }
        })
        .catch((error) => {
          console.error('Error:', error)
          if (wsLoadingEl) {
            wsLoadingEl.style.display = 'none'
          }
          if (feedbackDescription) {
            feedbackDescription.style.display = 'block'
          }
          buttonSubmit.disabled = false
        })
    })
  }

  if (userTranslationInput && feedbackDescription) {
    userTranslationInput.addEventListener('input', function () {
      const suggestionElement = feedbackDescription.querySelector(
        '.ws-feedback__sentence'
      )
      if (suggestionElement) {
        suggestionElement.remove()
      }
    })
  }

  function getActiveButton() {
    if (
      buttonSubmit &&
      !buttonSubmit.classList.contains('d-none') &&
      !buttonSubmit.disabled
    ) {
      return buttonSubmit
    }
    if (
      buttonNext &&
      !buttonNext.classList.contains('d-none') &&
      !buttonNext.disabled
    ) {
      return buttonNext
    }
    return null
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      const activeButton = getActiveButton()
      if (activeButton) {
        event.preventDefault()
        activeButton.click()
      }
    } else if (event.key === ' ' || event.code === 'Space') {
      if (
        userTranslationInput &&
        document.activeElement !== userTranslationInput
      ) {
        event.preventDefault()
        userTranslationInput.focus()
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
      event.preventDefault()
      const hintBtn = document.querySelector('.practice-actions__btn--hint')
      if (hintBtn) {
        hintBtn.click()
      }
    }
  })

  const shortcutsToggle = document.getElementById('practice-shortcuts-toggle')
  const shortcutsList = document.getElementById('practice-shortcuts-list')
  const shortcutsArrow = document.getElementById('practice-shortcuts-arrow')

  if (shortcutsToggle && shortcutsList && shortcutsArrow) {
    shortcutsToggle.addEventListener('click', function () {
      const isHidden = shortcutsList.classList.contains('d-none')
      if (isHidden) {
        shortcutsList.classList.remove('d-none')
        shortcutsArrow.classList.remove('fa-chevron-down')
        shortcutsArrow.classList.add('fa-chevron-up')
      } else {
        shortcutsList.classList.add('d-none')
        shortcutsArrow.classList.remove('fa-chevron-up')
        shortcutsArrow.classList.add('fa-chevron-down')
      }
    })
  }

  function getCompletedSentences() {
    const historySentences = getMergedHistorySentences()
    const completedSentences = new Set()

    historySentences.forEach((hisSentence) => {
      if (hisSentence.passed) {
        const sentenceIndex = listSentences.findIndex(
          (s) => s.content === hisSentence.sentence_original
        )
        if (sentenceIndex !== -1) {
          completedSentences.add(sentenceIndex)
        }
      }
    })

    return completedSentences
  }

  function getHistorySentenceByIndex(index) {
    const historySentences = getMergedHistorySentences()
    const sentence = listSentences[index]
    if (!sentence) return null

    return historySentences.find(
      (hisSentence) => hisSentence.sentence_original === sentence.content
    )
  }

  function renderHistoryList() {
    const historyListEl = document.getElementById('practice-history-list')
    if (!historyListEl || !listSentences.length) return

    const completedSentences = getCompletedSentences()

    let html = '<div class="practice-history__items">'

    listSentences.forEach((sentence, index) => {
      const isCompleted = completedSentences.has(index)

      const itemClass = isCompleted
        ? 'practice-history__item practice-history__item--completed practice-history__item--clickable'
        : 'practice-history__item'

      html += `
        <div class="${itemClass}" data-sentence-index="${index}">
          <div class="practice-history__item-number">${index + 1}</div>
          <div class="practice-history__item-content">
            <p class="practice-history__item-text">${escapeHTML(sentence.content || '')}</p>
            <span class="practice-history__item-status">
              ${isCompleted ? '<i class="fas fa-check-circle"></i> Đã hoàn thành' : '<i class="fas fa-circle"></i> Chưa hoàn thành'}
            </span>
          </div>
        </div>
      `
    })

    html += '</div>'
    historyListEl.innerHTML = html

    const historyItems = historyListEl.querySelectorAll(
      '.practice-history__item--clickable'
    )
    historyItems.forEach((item) => {
      item.addEventListener('click', function () {
        const sentenceIndex = parseInt(
          this.getAttribute('data-sentence-index'),
          10
        )
        if (isNaN(sentenceIndex)) return

        const historySentence = getHistorySentenceByIndex(sentenceIndex)
        if (!historySentence) return

        if (feedbackDescription) {
          feedbackDescription.style.display = 'block'
          feedbackDescription.innerHTML = renderFeedback(historySentence)
        }

        if (wsLoadingEl) {
          wsLoadingEl.style.display = 'none'
        }
      })
    })
  }

  function escapeHTML(text = '') {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const historyToggle = document.getElementById('practice-history-toggle')
  const historyList = document.getElementById('practice-history-list')
  const historyArrow = document.getElementById('practice-history-arrow')
  const resetHistoryBtn = document.querySelector('[reset-history-btn]')
  const resetModalEl = document.getElementById('ws-reset-modal')
  const resetCancelBtn = document.getElementById('ws-reset-modal-cancel')
  const resetConfirmBtn = document.getElementById('ws-reset-modal-confirm')

  if (historyToggle && historyList && historyArrow) {
    renderHistoryList()

    historyToggle.addEventListener('click', function () {
      const isHidden = historyList.classList.contains('d-none')
      if (isHidden) {
        historyList.classList.remove('d-none')
        historyArrow.classList.remove('fa-chevron-down')
        historyArrow.classList.add('fa-chevron-up')
      } else {
        historyList.classList.add('d-none')
        historyArrow.classList.remove('fa-chevron-up')
        historyArrow.classList.add('fa-chevron-down')
      }
    })
  }

  const showResetModal = () => {
    if (!resetModalEl) return
    resetModalEl.classList.add('practice-reset-modal--visible')
  }

  const hideResetModal = () => {
    if (!resetModalEl) return
    resetModalEl.classList.remove('practice-reset-modal--visible')
  }

  if (resetCancelBtn) {
    resetCancelBtn.addEventListener('click', hideResetModal)
  }

  if (resetModalEl) {
    resetModalEl.addEventListener('click', function (event) {
      if (event.target === resetModalEl) {
        hideResetModal()
      }
    })
  }

  if (resetHistoryBtn) {
    resetHistoryBtn.addEventListener('click', function () {
      if (!practiceSlug) return
      showResetModal()
    })
  }

  if (resetConfirmBtn) {
    resetConfirmBtn.addEventListener('click', async function () {
      if (!practiceSlug) {
        hideResetModal()
        return
      }
      resetConfirmBtn.disabled = true
      try {
        const endpoint = ApiBreakpoint.DELETE_HISTORY_PRACTICE_WS.replace(
          '{slug}',
          encodeURIComponent(practiceSlug)
        )
        const res = await fetch(endpoint, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete history')
        localStorage.removeItem(practiceHistoryKey)
        window.location.reload()
      } catch (error) {
        console.error('Xóa lịch sử thất bại:', error)
        if (typeof window.alertError === 'function') {
          window.alertError('Không thể xóa lịch sử. Vui lòng thử lại.')
        } else {
          alert('Không thể xóa lịch sử. Vui lòng thử lại.')
        }
      } finally {
        resetConfirmBtn.disabled = false
        hideResetModal()
      }
    })
  }
}

function formatHighlight(text = '') {
  return (text || '').replace(/\{([^}]+)\}/g, (_, group) => {
    return `<span class="letter-hi">${group}</span>`
  })
}

function renderSentenceTokens(tokens = []) {
  if (!tokens.length) return ''
  return tokens
    .map((token) => {
      if (token.state === 'original') {
        return `<span class="text-black">${token.text}</span>`
      }
      if (token.state === 'removed') {
        return `<span class="letter-incorrect">(${token.text})</span>`
      }
      return `<span class="letter-correct">${token.text}</span>`
    })
    .join(' ')
}

function renderCompletionSection(title, items = []) {
  if (!items.length) return ''
  const listItems = items
    .map((item) => `<li>${formatHighlight(item)}</li>`)
    .join('')
  return `
    <div class="ws-summary__section">
      <h3 class="ws-summary__subtitle"><span class="letter-pink">${title}</span></h3>
      <ul class="ws-summary__list">
        ${listItems}
      </ul>
    </div>
  `
}

function renderCompletion(result) {
  const tagClass = result.completion_success
    ? 'ws-feedback__tag--passed'
    : 'ws-feedback__tag--failed'
  const tagIcon = result.completion_success
    ? 'fa-circle-check'
    : 'fa-circle-xmark'
  const tagText = result.completion_success ? 'Hoàn thành' : 'Cần điều chỉnh'

  return `
    <div class="ws-summary">
      <div class="ws-feedback__tag ${tagClass}">
        <i class="fa-solid ${tagIcon}"></i>
        <span>${tagText}</span>
      </div>
      <h2 class="ws-summary__title">Đánh giá tổng quan</h2>
      ${renderCompletionSection('Điểm mạnh', result.strong_points)}
      ${renderCompletionSection('Lỗi thường gặp', result.common_mistakes)}
      ${renderCompletionSection('Lời khuyên', result.advice_for_improvement)}
      <p class="ws-summary__footer">
        ${formatHighlight(result.general_feedback || '')}
      </p>
    </div>
  `
}

// Write-sentence complete interactions
const wsComplete = document.querySelector('[data-complete-result]')
if (wsComplete) {
  const completeResult = JSON.parse(
    wsComplete.getAttribute('data-complete-result')
  )
  const renderTarget = document.querySelector('[render-complete-html]')
  if (renderTarget) {
    renderTarget.innerHTML = renderCompletion(completeResult)
  }
}
