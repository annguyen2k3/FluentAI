import { ApiBreakpoint } from '/js/api_breakpoint.js'

const cardsContainer = document.getElementById('speaking-cards-container')

if (cardsContainer) {
  const levelSelect = document.getElementById('filter-level')
  const topicSelect = document.getElementById('filter-topic')
  const statusSelect = document.getElementById('filter-status')
  const searchInput = document.getElementById('search-input')
  const searchBtn = document.querySelector('.speaking-choose__search-btn')
  const clearBtn = document.getElementById('clear-filters-btn')
  const paginationInfo = document.querySelector(
    '.speaking-choose__pagination-info'
  )
  const paginationControls = document.querySelector(
    '.speaking-choose__pagination-controls'
  )

  let currentPage = 1
  const limit = 9

  const state = {
    level: '',
    topic: '',
    status: '',
    search: '',
    sortKey: 'pos',
    sortOrder: 'asc'
  }

  function escapeHTML(text = '') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function resolveHistoryBadge(history) {
    const defaultBadge = { label: 'Mới', statusAttr: 'new' }
    if (!history || typeof history !== 'object' || !history.status) {
      return defaultBadge
    }
    if (history.status === 'in_progress') {
      return { label: 'Đang luyện', statusAttr: 'in-progress' }
    }
    if (history.status === 'completed') {
      return { label: 'Đã hoàn thành', statusAttr: 'completed' }
    }
    return defaultBadge
  }

  function renderCards(list) {
    if (!Array.isArray(list) || list.length === 0) {
      cardsContainer.innerHTML =
        '<div class="col-12"><p class="text-center mb-0">Không có danh sách nào phù hợp.</p></div>'
      return
    }

    cardsContainer.innerHTML = list
      .map((item) => {
        const slug = item.slug
        const sentencesPreview = Array.isArray(item.list)
          ? item.list.slice(0, 2)
          : []
        const topicTitle = item.topic?.title
          ? escapeHTML(item.topic.title)
          : 'Chủ đề chung'
        const topicIcon = item.topic?.fa_class_icon
          ? item.topic.fa_class_icon
          : 'far fa-folder-open'
        const levelTitle = item.level?.title
          ? escapeHTML(item.level.title)
          : 'Mọi cấp độ'
        const levelIcon = item.level?.fa_class_icon
          ? item.level.fa_class_icon
          : 'far fa-graduation-cap'
        const sentenceCount = item.list?.length || 0
        const badge = resolveHistoryBadge(item.history)
        return `
          <div class="col-12 col-lg-4">
            <div class="speaking-card">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="speaking-card__title m-0">${escapeHTML(
                  item.title || ''
                )}</h5>
                <span class="speaking-card__badge" data-status="${badge.statusAttr}">${badge.label}</span>
              </div>
              <div class="speaking-card__excerpt">
                ${
                  sentencesPreview.length
                    ? sentencesPreview
                        .map(
                          (sentence) => `
                            <p class="mb-2">
                              - ${escapeHTML(sentence.enSentence || '')}<br/>
                              &nbsp;&nbsp;${escapeHTML(sentence.viSentence || '')}
                            </p>
                        `
                        )
                        .join('')
                    : '<p class="mb-0">Đang cập nhật nội dung.</p>'
                }
              </div>
              <div class="d-flex flex-wrap gap-3 align-items-center speaking-card__meta">
                <span><i class="${topicIcon} me-1"></i>${topicTitle}</span>
                <span><i class="${levelIcon} me-1"></i>${levelTitle}</span>
                <span class="ms-auto speaking-card__attempt"><i class="far fa-list-alt me-1"></i>${sentenceCount} câu</span>
              </div>
              <div class="text-end">
                <a class="btn btn-primary speaking-card__btn" href="/speaking-sentence/practice/${slug}">Bắt đầu</a>
              </div>
            </div>
          </div>
        `
      })
      .join('')
  }

  function renderPagination(pagination) {
    if (!paginationInfo || !paginationControls) return
    const { page, total, totalPages } = pagination
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1
    const endItem = Math.min(page * limit, total)

    paginationInfo.textContent = `Hiển thị ${startItem} - ${endItem} của ${total} câu`
    paginationControls.innerHTML = ''

    const createButton = (label, disabled, onClick, extraClass = '') => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `speaking-choose__pagination-btn ${extraClass}`.trim()
      btn.disabled = disabled
      btn.innerHTML = label
      if (!disabled && typeof onClick === 'function') {
        btn.addEventListener('click', onClick)
      }
      return btn
    }

    const prevBtn = createButton(
      '<i class="fas fa-chevron-left"></i>',
      !pagination.hasPrevPage,
      () => {
        currentPage = Math.max(1, page - 1)
        fetchData()
      }
    )
    paginationControls.appendChild(prevBtn)

    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i += 1) {
      const isActive = i === page
      const btn = createButton(
        `${i}`,
        isActive,
        () => {
          currentPage = i
          fetchData()
        },
        isActive ? 'speaking-choose__pagination-btn--active' : ''
      )
      paginationControls.appendChild(btn)
    }

    const nextBtn = createButton(
      '<i class="fas fa-chevron-right"></i>',
      !pagination.hasNextPage,
      () => {
        currentPage = Math.min(totalPages, page + 1)
        fetchData()
      }
    )
    paginationControls.appendChild(nextBtn)
  }

  function setLoadingState() {
    cardsContainer.innerHTML =
      '<div class="col-12"><p class="text-center mb-0">Đang tải danh sách câu...</p></div>'
  }

  function fetchData() {
    setLoadingState()
    const requestUrl = new URL(ApiBreakpoint.GET_SS_LIST)
    requestUrl.searchParams.set('page', currentPage.toString())
    requestUrl.searchParams.set('limit', limit.toString())
    requestUrl.searchParams.set('sortKey', state.sortKey)
    requestUrl.searchParams.set('sortOrder', state.sortOrder)

    if (state.level) requestUrl.searchParams.set('level', state.level)
    if (state.topic) requestUrl.searchParams.set('topic', state.topic)
    if (state.search) requestUrl.searchParams.set('search', state.search)
    if (state.status) requestUrl.searchParams.set('status', state.status)

    fetch(requestUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          console.log('data', data)
          renderCards(data.data || [])
          if (data.pagination) {
            renderPagination(data.pagination)
          }
        } else {
          cardsContainer.innerHTML =
            '<div class="col-12"><p class="text-center text-danger mb-0">Không thể tải danh sách. Vui lòng thử lại.</p></div>'
        }
      })
      .catch(() => {
        cardsContainer.innerHTML =
          '<div class="col-12"><p class="text-center text-danger mb-0">Có lỗi khi kết nối đến máy chủ.</p></div>'
      })
  }

  function applyFilters() {
    state.level = levelSelect?.value || ''
    state.topic = topicSelect?.value || ''
    state.status = statusSelect?.value || ''
    state.search = searchInput?.value?.trim() || ''
    currentPage = 1
    fetchData()
  }

  levelSelect?.addEventListener('change', applyFilters)
  topicSelect?.addEventListener('change', applyFilters)
  statusSelect?.addEventListener('change', applyFilters)

  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters)
  }

  searchInput?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyFilters()
    }
  })

  clearBtn?.addEventListener('click', () => {
    if (levelSelect) levelSelect.value = ''
    if (topicSelect) topicSelect.value = ''
    if (statusSelect) statusSelect.value = ''
    if (searchInput) searchInput.value = ''
    applyFilters()
  })

  fetchData()
}
