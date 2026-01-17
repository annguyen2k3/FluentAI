import { ApiBreakpoint } from '/js/api_breakpoint.js'

const navWPSetup = document.querySelectorAll('.wp-setup__nav button.nav-link')
navWPSetup.forEach((nav) => {
  nav.addEventListener('click', function () {
    navWPSetup.forEach((n) => n.classList.remove('active'))
    this.classList.add('active')
    const nav = this.getAttribute('data-nav')
    if (nav === 'system') {
      document.querySelector('.wp-setup__nav-system').classList.remove('d-none')
      document.querySelector('.wp-setup__nav-custom').classList.add('d-none')
    } else if (nav === 'custom') {
      document.querySelector('.wp-setup__nav-system').classList.add('d-none')
      document.querySelector('.wp-setup__nav-custom').classList.remove('d-none')
    }
  })
})

const levelWPOptions = document.querySelectorAll('.wp-setup__option--level')
const topicWPTypes = document.querySelectorAll('.wp-setup__type')
levelWPOptions.forEach((opt) => {
  opt.addEventListener('click', function () {
    levelWPOptions.forEach((o) => o.removeAttribute('active'))
    this.setAttribute('active', '')
  })
})
topicWPTypes.forEach((opt) => {
  opt.addEventListener('click', function () {
    topicWPTypes.forEach((o) => o.removeAttribute('active'))
    this.setAttribute('active', '')
  })
})

const tooltipTriggerList = Array.from(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
)
tooltipTriggerList.forEach(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
)

const wpSetup = document.querySelector('div#wp-setup')
if (wpSetup) {
  const btnStart = wpSetup.querySelector('.wp-setup__start')
  btnStart.addEventListener('click', function (e) {
    e.preventDefault()
    const source = wpSetup
      .querySelector('.active[data-nav]')
      .getAttribute('data-nav')
    const level = wpSetup
      .querySelector('.wp-setup__option--level[active]')
      ?.getAttribute('data-value')
    const type = wpSetup
      .querySelector('.wp-setup__type[active]')
      ?.getAttribute('data-type')

    if (source === 'custom') {
      const content = wpSetup.querySelector('.wp-setup__custom-textarea').value
      const loadingOverlay = document.getElementById(
        'wp-preview-loading-overlay'
      )

      function showLoading() {
        if (loadingOverlay) {
          loadingOverlay.style.display = 'flex'
          document.body.style.overflow = 'hidden'
        }
      }

      function hideLoading() {
        if (loadingOverlay) {
          loadingOverlay.style.display = 'none'
          document.body.style.overflow = ''
        }
      }

      showLoading()
      const requestUrl = `${ApiBreakpoint.POST_PREVIEW_CONTENT_WP}`
      fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ content: content })
      })
        .then((response) => response.json())
        .then((data) => {
          hideLoading()
          console.log(data)
          if (data.status === 200) {
            const previewResult = data.previewResult || {}
            const modalEl = document.getElementById('wpPreviewModal')
            if (!modalEl) return

            const statusEl = document.getElementById('wpPreviewStatus')
            const descEl = document.getElementById('wpPreviewDescription')
            const titleEl = document.getElementById('wpPreviewTitle')
            const contentEl = document.getElementById('wpPreviewContent')
            const regenerateBtn = document.getElementById('wpPreviewRegenerate')
            const startBtn = document.getElementById('wpPreviewStart')

            if (statusEl) {
              statusEl.textContent = previewResult.passed ? 'Đạt' : 'Chưa đạt'
              statusEl.classList.remove('bg-success', 'bg-danger')
              statusEl.classList.add(
                previewResult.passed ? 'bg-success' : 'bg-danger'
              )
            }
            if (descEl) {
              descEl.textContent = previewResult.description || ''
            }
            if (titleEl) {
              titleEl.textContent = previewResult.title || ''
            }
            if (contentEl) {
              contentEl.textContent = previewResult.content || ''
            }

            if (regenerateBtn) {
              if (previewResult.passed) {
                regenerateBtn.style.display = 'none'
              } else {
                regenerateBtn.style.display = 'inline-block'
                regenerateBtn.textContent = 'Xem lại'
                regenerateBtn.onclick = () => {
                  const modal =
                    typeof bootstrap !== 'undefined'
                      ? bootstrap.Modal.getInstance(modalEl)
                      : null
                  if (modal) modal.hide()
                }
              }
            }

            if (startBtn) {
              if (previewResult.passed) {
                startBtn.style.display = 'inline-block'
                startBtn.onclick = () => {
                  if (data.wpPreview && data.wpPreview._id) {
                    window.location.href = `/writing-paragraph/practice/custom-topic/${data.wpPreview._id.toString()}`
                  } else {
                    alertError('Không thể bắt đầu luyện tập. Vui lòng thử lại.')
                  }
                }
              } else {
                startBtn.style.display = 'none'
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
        .catch((error) => {
          console.error('Error:', error)
          hideLoading()
        })
      return
    }

    if (!level) {
      alertError('Vui lòng chọn cấp độ')
      return
    }
    if (!type) {
      alertError('Vui lòng chọn loại nội dung')
      return
    }

    if (source === 'system') {
      if (type === 'ai-generate') {
        const topic = wpSetup.querySelector(
          '[data-type="ai-generate"] .wp-setup__prompt-input'
        ).value
        const level = wpSetup
          .querySelector('.wp-setup__option--level[active]')
          ?.getAttribute('data-value')
        const loadingOverlay = document.getElementById(
          'wp-preview-loading-overlay'
        )

        function showLoading() {
          if (loadingOverlay) {
            loadingOverlay.style.display = 'flex'
            document.body.style.overflow = 'hidden'
          }
        }

        function hideLoading() {
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none'
            document.body.style.overflow = ''
          }
        }

        showLoading()
        const requestUrl = `${ApiBreakpoint.POST_CUSTOM_TOPIC_PREVIEW_WP}`
        console.log('requestUrl', requestUrl)
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
            hideLoading()
            console.log(data)
            if (data.status === 200) {
              const previewResult = data.previewResult || {}
              const modalEl = document.getElementById('wpPreviewModal')
              if (!modalEl) return

              const statusEl = document.getElementById('wpPreviewStatus')
              const descEl = document.getElementById('wpPreviewDescription')
              const titleEl = document.getElementById('wpPreviewTitle')
              const contentEl = document.getElementById('wpPreviewContent')

              if (statusEl) {
                statusEl.textContent = previewResult.passed ? 'Đạt' : 'Chưa đạt'
                statusEl.classList.remove('bg-success', 'bg-danger')
                statusEl.classList.add(
                  previewResult.passed ? 'bg-success' : 'bg-danger'
                )
              }
              if (descEl) {
                descEl.textContent = previewResult.description || ''
              }
              if (titleEl) {
                titleEl.textContent = previewResult.title || ''
              }
              if (contentEl) {
                contentEl.textContent = previewResult.content || ''
              }

              const regenerateBtn = document.getElementById(
                'wpPreviewRegenerate'
              )
              if (regenerateBtn) {
                regenerateBtn.onclick = () => {
                  const loadingOverlay = document.getElementById(
                    'wp-preview-loading-overlay'
                  )

                  function showLoading() {
                    if (loadingOverlay) {
                      loadingOverlay.style.display = 'flex'
                      document.body.style.overflow = 'hidden'
                    }
                  }

                  function hideLoading() {
                    if (loadingOverlay) {
                      loadingOverlay.style.display = 'none'
                      document.body.style.overflow = ''
                    }
                  }

                  showLoading()
                  const reqUrl = `${ApiBreakpoint.POST_CUSTOM_TOPIC_PREVIEW_WP}`
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
                      hideLoading()
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
                        if (titleEl) titleEl.textContent = p.title || ''
                        if (contentEl) contentEl.textContent = p.content || ''
                      } else {
                        alertError(res.message)
                      }
                    })
                    .catch((err) => {
                      console.error('Error:', err)
                      hideLoading()
                    })
                }
              }

              const startBtn = document.getElementById('wpPreviewStart')
              if (startBtn) {
                startBtn.onclick = () => {
                  window.location.href = `/writing-paragraph/practice/custom-topic/${data.wpPreview._id.toString()}`
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
          .catch((error) => {
            console.error('Error:', error)
            hideLoading()
          })
      } else {
        window.location.href = `/writing-paragraph/system-list?level=${level}&type=${type}`
      }
    }
  })
}

const wpListChoose = document.querySelector('[wp-list-choose]')
if (wpListChoose) {
  let currentPage = 1
  const limit = 10
  let levelSlug = wpListChoose.getAttribute('level')
  let typeSlug = wpListChoose.getAttribute('type')
  let topicSlug = ''
  let statusId = ''

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
        loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
      })
    }
    buttonsContainer.appendChild(nextBtn)
  }

  function loadWPList(
    level,
    type,
    topic = '',
    status = '',
    page = 1,
    limit = 10
  ) {
    const requestUrl = new URL(ApiBreakpoint.GET_WP_LIST)

    if (level) {
      requestUrl.searchParams.set('level', level)
    }
    if (type) {
      requestUrl.searchParams.set('type', type)
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

    const wpListCards = document.querySelector('div[wp-list-cards]')
    if (wpListCards) {
      wpListCards.innerHTML =
        '<p class="text-center">Đang tải danh sách đoạn văn...</p>'
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
          const wpList = data.data || []
          const pagination = data.pagination

          if (wpList.length > 0) {
            wpListCards.innerHTML = ''
            wpList.forEach((wp) => {
              const title = escapeHTML(wp.title || '')
              const content = escapeHTML(wp.content || '')
              const topicTitle = wp.topic?.title
                ? escapeHTML(wp.topic.title)
                : 'Chủ đề chung'
              const historyStatus =
                wp.history?.content?.status || wp.history?.status || ''
              const statusValue = historyStatus || ''
              const status = mapStatusToBadge(statusValue)

              wpListCards.innerHTML += `
              <div class="col-12 col-lg-6">
                  <div class="wp-choose__card" id-wp=${wp._id.toString()} slug=${wp.slug}>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <h5 class="wp-choose__title m-0" title="${title}">${title}</h5>
                          <span class="wp-choose__badge" data-status="${status.key}">${status.label}</span>
                      </div>
                      <p class="wp-choose__excerpt wp-choose__excerpt--clamp">${content}</p>
                      <div class="d-flex flex-wrap gap-3 align-items-center wp-choose__meta">
                          <span><i class="far fa-folder-open me-1"></i>${topicTitle}</span>
                      </div>
                      <div class="text-end">
                          <a href="/writing-paragraph/practice/${wp.slug}" class="btn btn-primary wp-choose__btn">Bắt đầu</a>
                      </div>
                  </div>
              </div>
            `
            })
          } else {
            wpListCards.innerHTML = `
              <p class="text-center">Không có dữ liệu</p>
            `
          }

          if (pagination) {
            renderPagination(pagination)
          }
        } else {
          alertError(data.message)
          if (wpListCards) {
            wpListCards.innerHTML = `
              <p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>
            `
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        if (wpListCards) {
          wpListCards.innerHTML = `
            <p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu</p>
          `
        }
      })
  }

  loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)

  const filterTopic = wpListChoose.querySelector('select[filter-topic]')
  if (filterTopic) {
    filterTopic.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex]
      topicSlug = this.value || ''
      currentPage = 1
      loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
    })
  }

  const filterStatus = wpListChoose.querySelector('select[filter-status]')
  if (filterStatus) {
    filterStatus.addEventListener('change', function () {
      statusId = this.value || ''
      currentPage = 1
      loadWPList(levelSlug, typeSlug, topicSlug, statusId, currentPage, limit)
    })
  }

  const btnRandom = document.querySelector('[btn-random]')
  if (btnRandom) {
    btnRandom.addEventListener('click', function (e) {
      e.preventDefault()
      const idLevelRandom = wpListChoose.getAttribute('id-level')
      const idTypeRandom = wpListChoose.getAttribute('id-type')
      const idTopicRandom =
        wpListChoose.querySelector('select[filter-topic]')?.value || ''
      const requestUrl = new URL(ApiBreakpoint.GET_RANDOM_WP)
      if (idLevelRandom) {
        requestUrl.searchParams.set('level', idLevelRandom)
      }
      if (idTypeRandom) {
        requestUrl.searchParams.set('type', idTypeRandom)
      }
      if (idTopicRandom) {
        requestUrl.searchParams.set('topic', idTopicRandom)
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
            window.location.href = `/writing-paragraph/practice/${data.wp.slug}`
          } else {
            alertError(data.message)
          }
        })
        .catch((error) => console.error('Error:', error))
    })
  }
}

// Hàm tách đoạn văn thành mảng các câu
function splitParagraphIntoSentences(paragraph) {
  if (typeof paragraph !== 'string') {
    return []
  }
  const normalized = paragraph.replace(/[ \t]+/g, ' ').trim()
  if (!normalized) {
    return []
  }
  const placeholder = '§DOT§'
  const abbreviations = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'St']
  const protectedText = abbreviations.reduce((acc, abbr) => {
    const regex = new RegExp(`\\b${abbr}\\.`, 'gi')
    return acc.replace(regex, (match) => match.replace('.', placeholder))
  }, normalized)
  const pattern = /[^.!?…]+?(?:\.\.\.|[.!?…])|[^.!?…]+$/g
  const matches = protectedText.match(pattern) || []
  return matches
    .map((sentence) =>
      sentence.replace(new RegExp(placeholder, 'g'), '.').trim()
    )
    .filter((sentence) => sentence.length > 0)
}

const wpPractice = document.querySelector('[wp-data-practice]')
if (wpPractice) {
  const progressIndex = document.querySelector('[progress-index]')
  const progressTotal = document.querySelector('[progress-total]')
  const progressFill = document.querySelector('[progress-fill]')
  const sentencesDisplay = document.querySelector('[sentences-display]')
  const scoreInfoEl = document.getElementById('score-info-data')

  let currentIndex = 1

  const wpData = JSON.parse(wpPractice.getAttribute('wp-data-practice'))
  const hisWPUserAttr = wpPractice.getAttribute('wp-data-history')
  const hisWPUser = hisWPUserAttr ? JSON.parse(hisWPUserAttr) : null
  const rawScoreInfo = scoreInfoEl ? scoreInfoEl.textContent : '{}'

  let scoreInfo
  try {
    scoreInfo = JSON.parse(rawScoreInfo)
  } catch (error) {
    scoreInfo = { totalScore: 0, scorePractice: 0 }
  }

  wpPractice.removeAttribute('wp-data-practice')
  if (hisWPUserAttr) {
    wpPractice.removeAttribute('wp-data-history')
  }
  const sentences = splitParagraphIntoSentences(wpData.content)
  const pointsValueEl = document.querySelector('.practice-header__points-value')
  const pointsAddEl = document.querySelector('.practice-header__points-add')
  const creditsEl = document.querySelector('.practice-header__credits span')

  let currentTotalScore = scoreInfo.totalScore || 0
  const scorePerPractice = scoreInfo.scorePractice || 0

  let currentBalanceCredit = 0
  if (creditsEl) {
    const creditText = creditsEl.textContent || '0 xu'
    const match = creditText.match(/(\d+)/)
    currentBalanceCredit = match ? parseInt(match[1], 10) : 0
  }

  function animateScoreAdd() {
    if (!pointsValueEl || !pointsAddEl) return

    const newScore = currentTotalScore + scorePerPractice
    pointsAddEl.textContent = `+${scorePerPractice}`
    pointsAddEl.classList.remove('d-none')
    pointsAddEl.style.animation = 'none'

    setTimeout(() => {
      pointsAddEl.style.animation = 'scoreAddAnimation 0.8s ease-out forwards'
    }, 10)

    let startScore = currentTotalScore
    const endScore = newScore
    const duration = 600
    const startTime = Date.now()

    function updateScore() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentScore = Math.floor(
        startScore + (endScore - startScore) * easeOutCubic
      )

      if (pointsValueEl) {
        pointsValueEl.textContent = `${currentScore} điểm`
      }

      if (progress < 1) {
        requestAnimationFrame(updateScore)
      } else {
        currentTotalScore = endScore
        if (pointsValueEl) {
          pointsValueEl.textContent = `${currentTotalScore} điểm`
        }

        setTimeout(() => {
          if (pointsAddEl) {
            pointsAddEl.classList.add('d-none')
          }
        }, 800)
      }
    }

    requestAnimationFrame(updateScore)
  }

  function animateCreditDeduct(cost) {
    if (!creditsEl) return

    const newBalance = Math.max(0, currentBalanceCredit - cost)

    const deductEl = document.createElement('span')
    deductEl.className = 'practice-header__credits-deduct'
    deductEl.textContent = `-${cost}`
    deductEl.style.cssText =
      'position: absolute; color: #dc3545; font-weight: 700; font-size: 0.9rem; animation: creditDeductAnimation 1s ease-out forwards; pointer-events: none; z-index: 10;'
    creditsEl.parentElement.style.position = 'relative'
    creditsEl.parentElement.appendChild(deductEl)

    let startBalance = currentBalanceCredit
    const endBalance = newBalance
    const duration = 600
    const startTime = Date.now()

    function updateCredit() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCredit = Math.floor(
        startBalance + (endBalance - startBalance) * easeOutCubic
      )

      if (creditsEl) {
        creditsEl.textContent = `${currentCredit} xu`
      }

      if (progress < 1) {
        requestAnimationFrame(updateCredit)
      } else {
        currentBalanceCredit = endBalance
        if (creditsEl) {
          creditsEl.textContent = `${currentBalanceCredit} xu`
        }

        setTimeout(() => {
          if (deductEl && deductEl.parentElement) {
            deductEl.parentElement.removeChild(deductEl)
          }
        }, 1000)
      }
    }

    requestAnimationFrame(updateCredit)
  }

  sentencesDisplay.innerHTML = ''

  let firstInProgressIndex = sentences.length + 1

  const originalContent = wpData.content || ''
  const normalizedContent = originalContent
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()

  function findSentencePositionInOriginal(sentence, startPos = 0) {
    const normalizedSentence = sentence.replace(/[ \t]+/g, ' ').trim()
    const pos = normalizedContent.indexOf(normalizedSentence, startPos)
    return pos >= 0 ? pos : -1
  }

  function renderSentencesWithLineBreaks() {
    let html = ''
    let currentPos = 0
    const historyMap = new Map()

    if (
      hisWPUser &&
      hisWPUser.content &&
      Array.isArray(hisWPUser.content.sentences)
    ) {
      hisWPUser.content.sentences.forEach((histSentence) => {
        historyMap.set(histSentence.sentence_original, histSentence)
      })
    }

    sentences.forEach((sentence, index) => {
      const sentenceIndex = index + 1
      const normalizedSentence = sentence.replace(/[ \t]+/g, ' ').trim()
      const sentencePos = findSentencePositionInOriginal(
        normalizedSentence,
        currentPos
      )

      if (sentencePos > currentPos && currentPos > 0) {
        const textBetween = normalizedContent.substring(currentPos, sentencePos)
        if (textBetween.includes('\n')) {
          html += '<br>'
        } else if (textBetween.trim()) {
          html += ' '
        }
      }

      const historySentence = historyMap.get(sentence)
      let sentenceHtml = ''

      if (historySentence) {
        sentenceHtml = `<span class="sentence-complete" index=${sentenceIndex}>${historySentence.final_sentence || sentence}</span>`
      } else {
        if (firstInProgressIndex > sentenceIndex) {
          firstInProgressIndex = sentenceIndex
          sentenceHtml = `<span class="sentence-inprogress" index=${sentenceIndex}>${sentence}</span>`
        } else {
          sentenceHtml = `<span index=${sentenceIndex}>${sentence}</span>`
        }
      }

      html += sentenceHtml
      currentPos =
        sentencePos >= 0 ? sentencePos + normalizedSentence.length : currentPos

      if (index < sentences.length - 1) {
        const nextSentence = sentences[index + 1]
        const normalizedNextSentence = nextSentence
          .replace(/[ \t]+/g, ' ')
          .trim()
        const nextPos = findSentencePositionInOriginal(
          normalizedNextSentence,
          currentPos
        )

        if (nextPos > currentPos) {
          const textBetween = normalizedContent.substring(currentPos, nextPos)
          if (textBetween.includes('\n')) {
            html += '<br>'
          } else {
            html += ' '
          }
        } else {
          html += ' '
        }
      }
    })

    return html
  }

  if (
    hisWPUser &&
    hisWPUser.content &&
    Array.isArray(hisWPUser.content.sentences)
  ) {
    if (firstInProgressIndex <= sentences.length) {
      currentIndex = firstInProgressIndex
    } else {
      currentIndex = sentences.length + 1
    }
  } else {
    firstInProgressIndex = 1
    currentIndex = 1
  }

  sentencesDisplay.innerHTML = renderSentencesWithLineBreaks()

  function renderSentence(index) {
    const allSentenceElements = sentencesDisplay.querySelectorAll('[index]')
    allSentenceElements.forEach((el, idx) => {
      const sentenceIdx = idx + 1
      el.classList.remove('sentence-inprogress', 'sentence-complete')

      if (sentenceIdx < index) {
        el.classList.add('sentence-complete')
      } else if (sentenceIdx === index) {
        el.classList.add('sentence-inprogress')
      }
    })

    progressIndex.textContent = index
    progressTotal.textContent = sentences.length
    progressFill.style.width = `${(index / sentences.length) * 100}%`
  }

  if (firstInProgressIndex <= sentences.length) {
    renderSentence(currentIndex)
  } else {
    progressIndex.textContent = sentences.length
    progressTotal.textContent = sentences.length
    progressFill.style.width = '100%'
  }

  const buttonSubmit = document.querySelector('[button-submit]')
  const buttonNext = document.querySelector('[button-next]')
  const buttonQuit = document.querySelector('[button-quit]')
  const userTranslationInput = document.querySelector('[user_translation]')
  const feedbackDescription = document.querySelector('[feedback-description]')
  const wpLoadingEl = document.getElementById('wp-loading')
  let currentEvaluateResult = null
  if (buttonQuit) {
    buttonQuit.addEventListener('click', function (e) {
      e.preventDefault()
      window.location.href = `/writing-paragraph/system-list?level=${wpData.level.slug}&type=${wpData.type.slug}`
    })
  }
  if (buttonSubmit) {
    buttonSubmit.addEventListener('click', function () {
      const sentenceVi =
        document.querySelector('.sentence-inprogress').textContent || ''
      const userTranslation =
        document.querySelector('[user_translation]').value || ''
      if (!userTranslation) {
        alertError('Vui lòng nhập bản dịch của bạn')
        return
      }
      if (wpLoadingEl) {
        wpLoadingEl.style.display = 'flex'
      }
      if (feedbackDescription) {
        feedbackDescription.style.display = 'none'
      }
      buttonSubmit.disabled = true

      const isTabletOrMobile = window.innerWidth <= 1024
      const isMobile = window.innerWidth <= 768
      if (isTabletOrMobile) {
        const evaluationSection = document.getElementById('practice-evaluation')
        if (evaluationSection) {
          setTimeout(() => {
            if (isMobile) {
              const rect = evaluationSection.getBoundingClientRect()
              const scrollOffset = 120
              window.scrollTo({
                top: window.pageYOffset + rect.top - scrollOffset,
                behavior: 'smooth'
              })
            } else {
              evaluationSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              })
            }
          }, 100)
        }
      }

      const requestUrl = `${ApiBreakpoint.POST_PRACTICE_WP}/${wpData.slug}`
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
          console.log(data)
          if (wpLoadingEl) {
            wpLoadingEl.style.display = 'none'
          }
          if (feedbackDescription) {
            feedbackDescription.style.display = 'block'
          }
          buttonSubmit.disabled = false
          if (data.status === 200) {
            if (feedbackDescription) {
              feedbackDescription.innerHTML = renderFeedback(
                data.evaluateResult
              )
            }
            if (userTranslationInput) {
              userTranslationInput.value = ''
            }

            const practiceCost = parseInt(
              buttonSubmit.getAttribute('cost-practice') || '0',
              10
            )
            if (practiceCost > 0) {
              animateCreditDeduct(practiceCost)
            }

            if (data.evaluateResult.passed) {
              currentEvaluateResult = data.evaluateResult

              animateScoreAdd()

              if (userTranslationInput) {
                userTranslationInput.disabled = true
              }
              if (currentIndex === sentences.length) {
                const loadingOverlay = document.getElementById(
                  'practice-complete-loading'
                )
                if (loadingOverlay) {
                  loadingOverlay.style.display = 'flex'
                }
                setTimeout(() => {
                  window.location.href = `/writing-paragraph/practice/complete/${wpData.slug}`
                }, 300)
              } else {
                buttonNext.classList.remove('d-none')
                buttonSubmit.classList.add('d-none')
              }
            } else {
              buttonNext.classList.add('d-none')
              buttonSubmit.classList.remove('d-none')
              currentEvaluateResult = null
            }
          } else {
            alertError(data.message)
          }
        })
        .catch((error) => {
          console.error('Error:', error)
          if (wpLoadingEl) {
            wpLoadingEl.style.display = 'none'
          }
          if (feedbackDescription) {
            feedbackDescription.style.display = 'block'
          }
          buttonSubmit.disabled = false
        })
    })
  }

  if (buttonNext) {
    buttonNext.addEventListener('click', function () {
      if (currentEvaluateResult && currentEvaluateResult.final_sentence) {
        const currentSentenceElement =
          sentencesDisplay.querySelector(`.sentence-inprogress`)
        if (currentSentenceElement) {
          currentSentenceElement.textContent =
            currentEvaluateResult.final_sentence
          currentSentenceElement.classList.remove('sentence-inprogress')
          currentSentenceElement.classList.add('sentence-complete')
        }
      }
      currentIndex++
      if (currentIndex <= sentences.length) {
        renderSentence(currentIndex)
      }
      buttonNext.classList.add('d-none')
      buttonSubmit.classList.remove('d-none')
      currentEvaluateResult = null
      if (userTranslationInput) {
        userTranslationInput.value = ''
        userTranslationInput.disabled = false
      }
      if (feedbackDescription) {
        feedbackDescription.innerHTML = `
          Click 
          <span class="letter-highlight">Submit</span>
          to get feedback from 
          <span class="letter-highlight">AI</span>
          . The system will review your translation and point out its strengths and areas for improvement.
        `
      }
    })
  }

  function formatHighlight(text = '') {
    return (text || '').replace(/\{([^}]+)\}/g, (_, group) => {
      return `<span class="letter-hi">${group}</span>`
    })
  }

  function getSentenceTextFromTokens(tokens = []) {
    if (!tokens.length) return ''
    return tokens
      .map((token) => {
        if (token.state === 'removed') {
          return ''
        }
        return token.text
      })
      .filter((text) => text.trim().length > 0)
      .join(' ')
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

  const practiceSlug = wpData.slug
  const resetHistoryBtn = document.querySelector('[reset-history-btn]')
  const resetModalEl = document.getElementById('wp-reset-modal')
  const resetCancelBtn = document.getElementById('wp-reset-modal-cancel')
  const resetConfirmBtn = document.getElementById('wp-reset-modal-confirm')

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
        const endpoint = ApiBreakpoint.DELETE_HISTORY_PRACTICE_WP.replace(
          '{slug}',
          encodeURIComponent(practiceSlug)
        )
        const res = await fetch(endpoint, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete history')
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

const wpComplete = document.querySelector('[data-complete-result]')
if (wpComplete) {
  const completeResult = JSON.parse(
    wpComplete.getAttribute('data-complete-result')
  )
  const renderTarget = document.querySelector('[render-complete-html]')
  if (renderTarget) {
    renderTarget.innerHTML = renderCompletion(completeResult)
  }
}
