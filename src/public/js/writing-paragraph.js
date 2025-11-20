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
        .catch((error) => console.error('Error:', error))
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
                    .catch((err) => console.error('Error:', err))
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
          .catch((error) => console.error('Error:', error))
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
        loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)
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
        loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)
      })
    }
    buttonsContainer.appendChild(nextBtn)
  }

  function loadWPList(level, type, topic = '', page = 1, limit = 10) {
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
              wpListCards.innerHTML += `
              <div class="col-12 col-lg-6">
                  <div class="wp-choose__card" id-wp=${wp._id.toString()} slug=${wp.slug}>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <h5 class="wp-choose__title m-0">${wp.title}</h5>
                          <span class="wp-choose__badge" new>Mới</span>
                      </div>
                      <p class="wp-choose__excerpt wp-choose__excerpt--clamp">${wp.content}</p>
                      <div class="d-flex flex-wrap gap-3 align-items-center wp-choose__meta">
                          <span><i class="far fa-clock me-1"></i>Chưa luyện tập</span>
                          <span><i class="far fa-folder-open me-1"></i>${wp.topic.title}</span>
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

  loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)

  const filterTopic = wpListChoose.querySelector('select[filter-topic]')
  if (filterTopic) {
    filterTopic.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex]
      topicSlug = this.value || ''
      currentPage = 1
      loadWPList(levelSlug, typeSlug, topicSlug, currentPage, limit)
    })
  }
}

// Hàm tách đoạn văn thành mảng các câu
function splitParagraphIntoSentences(paragraph) {
  if (typeof paragraph !== 'string') {
    return []
  }
  const normalized = paragraph.replace(/\s+/g, ' ').trim()
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

  let currentIndex = 1

  const wpData = JSON.parse(wpPractice.getAttribute('wp-data-practice'))
  const sentences = splitParagraphIntoSentences(wpData.content)

  sentencesDisplay.innerHTML = ''
  sentences.forEach((sentence, index) => {
    sentencesDisplay.innerHTML += `
      <span index=${index + 1}>${sentence}</span>
    `
  })

  function renderSentence(index) {
    for (let i = 1; i < index; i++) {
      sentencesDisplay
        .querySelector(`[index="${i}"]`)
        .classList.remove('sentence-inprogress')
      sentencesDisplay
        .querySelector(`[index="${i}"]`)
        .classList.add('sentence-complete')
    }
    sentencesDisplay
      .querySelector(`[index="${index}"]`)
      .classList.add('sentence-inprogress')
    progressIndex.textContent = index
    progressTotal.textContent = sentences.length
    progressFill.style.width = `${(index / sentences.length) * 100}%`
  }

  renderSentence(currentIndex)

  const buttonSubmit = document.querySelector('[button-submit]')
  const buttonNext = document.querySelector('[button-next]')
  const buttonQuit = document.querySelector('[button-quit]')
  if (buttonQuit) {
    buttonQuit.addEventListener('click', function () {
      window.location.href = `/writing-paragraph/setup`
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
          if (data.status === 200) {
            const feedbackDescription = document.querySelector(
              '[feedback-description]'
            )
            if (feedbackDescription) {
              feedbackDescription.innerHTML = data.evaluateResult.Feedback_html
            }
            if (data.evaluateResult.Passed) {
              buttonNext.classList.remove('d-none')
              buttonSubmit.classList.add('d-none')
            } else {
              buttonNext.classList.add('d-none')
              buttonSubmit.classList.remove('d-none')
            }
            document.querySelector('[user_translation]').value = ''
            if (currentIndex === sentences.length) {
              window.location.href = `/writing-paragraph/practice/complete/${wpData.slug}`
            }
          } else {
            alertError(data.message)
          }
        })
        .catch((error) => console.error('Error:', error))
    })
  }

  if (buttonNext) {
    buttonNext.addEventListener('click', function () {
      currentIndex++
      renderSentence(currentIndex)
      buttonNext.classList.add('d-none')
      buttonSubmit.classList.remove('d-none')
      document.querySelector('[user_translation]').value = ''
    })
  }
}
