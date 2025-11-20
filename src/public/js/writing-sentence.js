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
        loadWSList(levelId, topicId, currentPage, limit)
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
        loadWSList(levelId, topicId, currentPage, limit)
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
        loadWSList(levelId, topicId, currentPage, limit)
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
        loadWSList(levelId, topicId, currentPage, limit)
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
        loadWSList(levelId, topicId, currentPage, limit)
      })
    }
    buttonsContainer.appendChild(nextBtn)
  }

  function loadWSList(level, topic = '', page = 1, limit = 10) {
    const requestUrl = new URL(ApiBreakpoint.GET_WS_LIST)

    if (level) {
      requestUrl.searchParams.set('level', level)
    }
    if (topic) {
      requestUrl.searchParams.set('topic', topic)
    }
    if (page) {
      requestUrl.searchParams.set('page', page)
    }
    if (limit) {
      requestUrl.searchParams.set('limit', limit)
    }

    console.log('requestUrl', requestUrl)

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
              wsListCards.innerHTML += `
              <div class="col-12 col-lg-6">
                  <div class="wp-choose__card" id-ws=${ws._id.toString()} slug=${ws.slug}>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <h5 class="wp-choose__title m-0">${ws.title}</h5>
                          <span class="wp-choose__badge" new>Mới</span>
                      </div>
                      <p class="wp-choose__excerpt">${ws.list && ws.list[0] ? ws.list[0].content : ''}</p>
                      <div class="d-flex flex-wrap gap-3 align-items-center wp-choose__meta">
                          <span><i class="far fa-clock me-1"></i>Chưa luyện tập</span>
                          <span><i class="far fa-folder-open me-1"></i>${ws.topic.title}</span>
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

  loadWSList(levelId, topicId, currentPage, limit)

  const filterTopic = document.querySelector('select[filter-topic]')
  if (filterTopic) {
    filterTopic.addEventListener('change', function () {
      topicId = this.value || ''
      currentPage = 1
      loadWSList(levelId, topicId, currentPage, limit)
    })
  }

  const btnRandom = document.querySelector('[btn-random]')
  if (btnRandom) {
    btnRandom.addEventListener('click', function () {
      const levelRandom = wsListChoose.getAttribute('level')
      const topicRandom =
        document.querySelector('select[filter-topic]').value || ''

      console.log('levelRandom', levelRandom)
      console.log('topicRandom', topicRandom)
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
  const wsData = JSON.parse(wsPractice.getAttribute('ws-data-practice'))
  const feedbackDescription = document.querySelector('[feedback-description]')
  const buttonSubmit = document.querySelector('[button-submit]')
  const buttonNext = document.querySelector('[button-next]')

  const listSentences = wsData.list
  let currentIndex = 1

  function renderSentence(index) {
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
              <button class="hint-modal__add-btn">+ Thêm vào từ điển</button>
            </div>
          `
        })
      }
    }
  }

  renderSentence(currentIndex)

  const buttonQuit = document.querySelector('[button-quit]')
  if (buttonQuit) {
    buttonQuit.addEventListener('click', function () {
      window.location.href = `/writing-sentence/system-list`
    })
  }

  buttonNext.addEventListener('click', function () {
    currentIndex++
    renderSentence(currentIndex)
    buttonNext.classList.add('d-none')
    buttonSubmit.classList.remove('d-none')
    document.querySelector('[user_translation]').value = ''
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
      const requestUrl = `${ApiBreakpoint.POST_PRACTICE_WS}/${wsData.slug}`
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
          if (data.status === 200) {
            console.log(data.evaluateResult)
            feedbackDescription.innerHTML = data.evaluateResult.Feedback_html
            if (data.evaluateResult.Passed) {
              console.log(currentIndex)
              console.log(listSentences.length)
              if (currentIndex === listSentences.length) {
                window.location.href = `/writing-sentence/practice/complete/${wsData.slug}`
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
        .catch((error) => console.error('Error:', error))
    })
  }
}
