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

      console.log(levelSlug, topicType)
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
