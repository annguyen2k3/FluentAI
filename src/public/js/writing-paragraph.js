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

const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
tooltipTriggerList.forEach((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

const wpSetup = document.querySelector('div#wp-setup')
if (wpSetup) {
  const btnStart = wpSetup.querySelector('.wp-setup__start')
  console.log(btnStart)
  btnStart.addEventListener('click', function (e) {
    e.preventDefault()
    const source = wpSetup.querySelector('.active[data-nav]').getAttribute('data-nav')
    const level = wpSetup.querySelector('.wp-setup__option--level[active]')?.getAttribute('data-value')
    const type = wpSetup.querySelector('.wp-setup__type[active]')?.getAttribute('data-type')

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
        console.log('ai-generate')
      } else {
        window.location.href = `/writing-paragraph/system-list?level=${level}&type=${type}`
      }
    }
  })
}

function renderWPList() {
  const wpListChoose = document.querySelector('[wp-list-choose]')
  if (wpListChoose) {
    const level = wpListChoose.getAttribute('level')
    const type = wpListChoose.getAttribute('type')
    const topic = wpListChoose.querySelector('select[filter-topic]').value

    console.log('level', level)
    console.log('type', type)
    console.log('topic', topic)

    const requestUrl = new URL(ApiBreakpoint.GET_WP_LIST)
    requestUrl.searchParams.set('level', level)
    requestUrl.searchParams.set('type', type)
    if (topic) {
      requestUrl.searchParams.set('topic', topic)
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
          if (data.list.length > 0) {
            const wpList = data.list
            const wpListCards = document.querySelector('div[wp-list-cards]')
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
            const wpListCards = document.querySelector('div[wp-list-cards]')
            wpListCards.innerHTML = `
              <p class="text-center">Không có dữ liệu</p>
            `
          }
        } else {
          alertError(data.message)
        }
      })
      .catch((error) => console.error('Error:', error))
  }
}

renderWPList()

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
    .map((sentence) => sentence.replace(new RegExp(placeholder, 'g'), '.').trim())
    .filter((sentence) => sentence.length > 0)
}

const wpPractice = document.querySelector('[wp-data-practice]')
if (wpPractice) {
  const progressIndex = document.querySelector('[progress-index]')
  const progressTotal = document.querySelector('[progress-total]')
  const progressFill = document.querySelector('[progress-fill]')
  const sentencesDisplay = document.querySelector('[sentences-display]')

  const currentIndex = 1

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
      sentencesDisplay.querySelector(`[index="${i}"]`).classList.remove('sentence-inprogress')
      sentencesDisplay.querySelector(`[index="${i}"]`).classList.add('sentence-complete')
    }
    sentencesDisplay.querySelector(`[index="${index}"]`).classList.add('sentence-inprogress')
    progressIndex.textContent = index
    progressTotal.textContent = sentences.length
    progressFill.style.width = `${(index / sentences.length) * 100}%`
  }

  renderSentence(currentIndex)
}
