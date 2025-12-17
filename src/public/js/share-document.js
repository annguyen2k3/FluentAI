import { ApiBreakpoint } from '/js/api_breakpoint.js'

async function toggleBookmark(
  button,
  docId,
  bookmarksRef = null,
  rootEl = null
) {
  const icon = button.querySelector('i')
  if (!icon || !docId) {
    console.error('toggleBookmark: Missing icon or docId', { icon, docId })
    return
  }

  const isBookmarked = icon.classList.contains('fa-solid')
  const apiUrl = isBookmarked
    ? ApiBreakpoint.POST_UNBOOKMARK_SHARE_DOCUMENT
    : ApiBreakpoint.POST_BOOKMARK_SHARE_DOCUMENT

  button.disabled = true

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ shareDocumentId: docId })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      if (typeof window.alertError === 'function') {
        window.alertError(
          errorData.message || `Lỗi ${res.status}: ${res.statusText}`
        )
      }
      return
    }

    const data = await res.json()

    if (data.status === 200) {
      if (isBookmarked) {
        icon.classList.remove('fa-solid')
        icon.classList.add('fa-regular')
        if (bookmarksRef && rootEl) {
          const index = bookmarksRef.indexOf(docId)
          if (index > -1) {
            bookmarksRef.splice(index, 1)
            rootEl.setAttribute('data-bookmarks', JSON.stringify(bookmarksRef))
          }
        }
      } else {
        icon.classList.remove('fa-regular')
        icon.classList.add('fa-solid')
        if (bookmarksRef && rootEl) {
          if (!bookmarksRef.includes(docId)) {
            bookmarksRef.push(docId)
            rootEl.setAttribute('data-bookmarks', JSON.stringify(bookmarksRef))
          }
        }
      }
      if (typeof window.alertSuccess === 'function') {
        window.alertSuccess(
          data.message ||
            (isBookmarked ? 'Đã bỏ lưu bài viết' : 'Đã lưu bài viết')
        )
      }
    } else {
      if (typeof window.alertError === 'function') {
        window.alertError(data.message || 'Có lỗi xảy ra')
      }
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    if (typeof window.alertError === 'function') {
      window.alertError('Có lỗi xảy ra khi lưu bài viết')
    }
  } finally {
    button.disabled = false
  }
}

const root = document.querySelector('[data-share-document-list]')

if (root) {
  const hasUser = root.getAttribute('data-has-user') === '1'
  const cardsEl = document.querySelector('[sd-cards]')
  const searchInput = document.querySelector('[sd-search]')
  const infoEl = document.querySelector('[sd-pagination-info]')
  const prevBtn = document.querySelector('[sd-prev]')
  const nextBtn = document.querySelector('[sd-next]')
  const currentBtn = document.querySelector('[sd-current]')

  let bookmarks = []
  try {
    const bookmarksAttr = root.getAttribute('data-bookmarks')
    if (bookmarksAttr) {
      bookmarks = JSON.parse(bookmarksAttr)
    }
  } catch (error) {
    console.error('Error parsing bookmarks:', error)
    bookmarks = []
  }

  const state = {
    page: 1,
    limit: 10,
    search: ''
  }

  function escapeHTML(text = '') {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function stripHtml(html = '') {
    const div = document.createElement('div')
    div.innerHTML = html || ''
    return (div.textContent || div.innerText || '').trim()
  }

  function truncate(text = '', maxLen = 90) {
    const s = (text || '').trim()
    if (s.length <= maxLen) return s
    return `${s.slice(0, maxLen).trim()}...`
  }

  function buildQuery() {
    const params = new URLSearchParams()
    params.set('page', state.page.toString())
    params.set('limit', state.limit.toString())
    if (state.search) params.set('search', state.search)
    return params.toString()
  }

  function renderPagination(pagination) {
    if (!pagination) return
    const { page, limit, total, hasNextPage, hasPrevPage } = pagination
    const start = total === 0 ? 0 : (page - 1) * limit + 1
    const end = Math.min(page * limit, total)

    if (infoEl) {
      infoEl.textContent = `Hiển thị ${start}-${end} trên tổng số ${total}`
    }

    if (currentBtn) {
      currentBtn.textContent = page.toString()
    }
    if (prevBtn) prevBtn.disabled = !hasPrevPage
    if (nextBtn) nextBtn.disabled = !hasNextPage
  }

  function renderCards(items = []) {
    if (!cardsEl) return

    if (!items.length) {
      cardsEl.innerHTML = `
        <div class="col-12">
          <p class="text-center text-muted mb-0">Không tìm thấy tài liệu phù hợp.</p>
        </div>
      `
      return
    }

    cardsEl.innerHTML = items
      .map((doc) => {
        const title = escapeHTML(doc.title || '')
        const author = escapeHTML(doc.author || 'Quản trị viên')
        const slug = encodeURIComponent(doc.slug || '')
        const docId = (doc._id || '').toString()
        const rawDesc = stripHtml(doc.content || '')
        const desc = escapeHTML(truncate(rawDesc, 90))

        const isBookmarked = bookmarks.includes(docId)
        const bookmarkIconClass = isBookmarked ? 'fa-solid' : 'fa-regular'

        const saveBtn = hasUser
          ? `
              <button type="button" class="btn sd-list__save" aria-label="Lưu bài viết" sd-save data-doc-id="${escapeHTML(docId)}">
                <i class="${bookmarkIconClass} fa-bookmark"></i>
              </button>
            `
          : ''

        return `
          <div class="col-12">
            <div class="sd-list__item d-flex align-items-center justify-content-between gap-3">
              <a class="sd-list__link d-flex align-items-center gap-3 text-decoration-none flex-grow-1" href="/share-document/${slug}">
                <div class="sd-list__icon">
                  <i class="fa-solid fa-file-lines"></i>
                </div>
                <div class="sd-list__text">
                  <div class="sd-list__title">${title}</div>
                  <div class="sd-list__desc">${desc}</div>
                  <div class="sd-list__meta">
                    <span><i class="fa-solid fa-user me-1"></i>${author}</span>
                  </div>
                </div>
              </a>
              ${saveBtn}
            </div>
          </div>
        `
      })
      .join('')

    if (hasUser) {
      attachBookmarkHandlers()
    }
  }

  function attachBookmarkHandlers() {
    const saveButtons = document.querySelectorAll('[sd-save]')
    saveButtons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        const docId = this.getAttribute('data-doc-id')
        if (docId) {
          toggleBookmark(this, docId, bookmarks, root)
        } else {
          console.error('No docId found on button')
        }
      })
    })
  }

  async function fetchList() {
    if (cardsEl) {
      cardsEl.innerHTML = `
        <div class="col-12">
          <p class="text-center mb-0">Đang tải danh sách tài liệu...</p>
        </div>
      `
    }

    try {
      const query = buildQuery()
      const url = `${ApiBreakpoint.GET_SHARE_DOCUMENT_LIST}?${query}`
      const res = await fetch(url, { method: 'GET' })
      const data = await res.json()

      const list = data?.shareDocumentList || {}
      const items = Array.isArray(list.data) ? list.data : []
      renderCards(items)
      renderPagination(list.pagination)
    } catch (error) {
      console.error('Error fetching share document list:', error)
      if (cardsEl) {
        cardsEl.innerHTML = `
          <div class="col-12">
            <p class="text-center text-danger mb-0">Có lỗi khi tải danh sách tài liệu.</p>
          </div>
        `
      }
    }
  }

  let searchTimeout = null
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = (this.value || '').trim()
      state.page = 1
      if (searchTimeout) clearTimeout(searchTimeout)
      searchTimeout = setTimeout(fetchList, 400)
    })
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (state.page > 1) {
        state.page -= 1
        fetchList()
      }
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      state.page += 1
      fetchList()
    })
  }

  fetchList()
}

const detailRoot = document.querySelector('[data-share-document-detail]')
if (detailRoot) {
  const hasUser = detailRoot.getAttribute('data-has-user') === '1'
  const saveBtn = document.querySelector('[sd-save]')

  let detailBookmarks = []
  try {
    const bookmarksAttr = detailRoot.getAttribute('data-bookmarks')
    if (bookmarksAttr) {
      detailBookmarks = JSON.parse(bookmarksAttr)
    }
  } catch (error) {
    console.error('Error parsing bookmarks:', error)
    detailBookmarks = []
  }

  if (saveBtn && hasUser) {
    saveBtn.addEventListener('click', async function (e) {
      e.preventDefault()
      const docId = this.getAttribute('data-doc-id')
      if (!docId) {
        console.error('No docId found on detail button')
        if (typeof window.alertError === 'function') {
          window.alertError('Không tìm thấy ID tài liệu')
        }
        return
      }

      await toggleBookmark(this, docId, detailBookmarks, detailRoot)
    })
  }
}
