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
      levelOptions.forEach((o) => o.classList.remove('ws-setup__option--active'))
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
      const levelChoose = wsSetup.querySelector('.ws-setup__option--level[active]')
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
          const wsList = data.data
          if (wsList.length > 0) {
            const wsListCards = document.querySelector('div[ws-list-cards]')
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
            const wsListCards = document.querySelector('div[ws-list-cards]')
            wsListCards.innerHTML = `
              <p class="text-center">Không có dữ liệu</p>
            `
          }
        } else {
          alertError(data.message)
        }
      })
      .catch((error) => console.error('Error:', error))
  }

  // Initialize startup
  let levelId = wsListChoose.getAttribute('level')
  let topicId = wsListChoose.getAttribute('topic')
  loadWSList(levelId, topicId)

  // Add event listener to filter topic
  const filterTopic = document.querySelector('select[filter-topic]')
  if (filterTopic) {
    filterTopic.addEventListener('change', function () {
      topicId = this.value || ''
      loadWSList(levelId, topicId)
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
      const sentenceVi = document.querySelector('[sentence_vi]').textContent || ''
      const userTranslation = document.querySelector('[user_translation]').value || ''
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
        body: JSON.stringify({ sentence_vi: sentenceVi, user_translation: userTranslation })
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
