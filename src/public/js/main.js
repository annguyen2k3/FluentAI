// Home page functionality
;(function () {
  // Generate calendar
  function generateCalendar() {
    const calendarGrid = document.querySelector('.calendar__grid')
    if (!calendarGrid) return

    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    // Clear existing content
    calendarGrid.innerHTML = ''

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      const emptyDay = document.createElement('div')
      emptyDay.className = 'calendar__day'
      calendarGrid.appendChild(emptyDay)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div')
      dayElement.className = 'calendar__day'
      dayElement.textContent = day

      // Mark today
      if (day === today.getDate()) {
        dayElement.classList.add('calendar__day--active')
      }

      // Randomly mark some days as missed (for demo)
      if (Math.random() < 0.3 && day < today.getDate()) {
        dayElement.classList.add('calendar__day--missed')
      }

      calendarGrid.appendChild(dayElement)
    }
  }

  // Initialize calendar when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateCalendar)
  } else {
    generateCalendar()
  }

  // Sidebar navigation functionality
  const sidebarLinks = document.querySelectorAll('.sidebar__link')
  const sidebarSublinks = document.querySelectorAll('.sidebar__sublink')

  sidebarLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      // Handle expandable links
      if (this.classList.contains('sidebar__link--expandable')) {
        e.preventDefault()
        const target = this.getAttribute('data-bs-target')
        const collapseElement = document.querySelector(target)
        const isExpanded = this.getAttribute('aria-expanded') === 'true'

        // Toggle aria-expanded
        this.setAttribute('aria-expanded', !isExpanded)

        // Bootstrap will handle the collapse/expand animation
        return
      }

      // Remove active class from all links and sublinks
      sidebarLinks.forEach((l) => l.classList.remove('sidebar__link--active'))
      sidebarSublinks.forEach((sl) => sl.classList.remove('sidebar__sublink--active'))
      // Add active class to clicked link
      this.classList.add('sidebar__link--active')
    })
  })

  // Handle submenu links
  sidebarSublinks.forEach((sublink) => {
    sublink.addEventListener('click', function (e) {
      e.preventDefault()

      // Remove active class from all links and sublinks
      sidebarLinks.forEach((l) => l.classList.remove('sidebar__link--active'))
      sidebarSublinks.forEach((sl) => sl.classList.remove('sidebar__sublink--active'))

      // Add active class to clicked sublink
      this.classList.add('sidebar__sublink--active')
    })
  })

  // Feature cards hover effect
  const featureCards = document.querySelectorAll('.feature-card')
  featureCards.forEach((card) => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-8px)'
    })

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)'
    })
  })

  // Article items click functionality
  const articleItems = document.querySelectorAll('.article-item__title')
  articleItems.forEach((item) => {
    item.addEventListener('click', function () {
      alert('Tính năng xem bài viết sẽ được tích hợp sau.')
    })
  })

  // Mobile sidebar toggle (if needed)
  function initMobileSidebar() {
    const sidebar = document.querySelector('.sidebar')
    const toggleBtn = document.createElement('button')
    toggleBtn.className = 'btn btn-primary d-md-none position-fixed'
    toggleBtn.style.cssText = 'top: 1rem; left: 1rem; z-index: 1001;'
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>'

    document.body.appendChild(toggleBtn)

    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('show')
    })

    // Close sidebar when clicking outside
    document.addEventListener('click', function (e) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('show')
      }
    })
  }

  // Initialize mobile sidebar
  if (window.innerWidth <= 768) {
    initMobileSidebar()
  }

  // Notification bell functionality
  const notificationBell = document.querySelector('.header__icon')
  if (notificationBell) {
    notificationBell.addEventListener('click', function () {
      alert('Bạn có 3 thông báo mới!')
    })
  }

  // Ranking item interactions
  const rankingItems = document.querySelectorAll('.ranking-item')
  rankingItems.forEach((item) => {
    item.addEventListener('click', function () {
      const name = this.querySelector('.ranking-item__name').textContent
      if (name !== '-') {
        alert(`Xem thông tin chi tiết của ${name}`)
      }
    })
  })

  // Ranking see more functionality
  const rankingSeeMore = document.querySelector('.ranking-card__see-more')
  if (rankingSeeMore) {
    rankingSeeMore.addEventListener('click', function (e) {
      e.preventDefault()
      alert('Tính năng xem thêm bảng xếp hạng sẽ được tích hợp sau.')
    })
  }

  // Avatar modal functionality
  const avatarContainer = document.querySelector('.header__avatar')
  const avatarModal = document.querySelector('.avatar-modal')

  if (avatarContainer && avatarModal) {
    let hoverTimeout

    // Show modal on hover
    avatarContainer.addEventListener('mouseenter', function () {
      clearTimeout(hoverTimeout)
      avatarModal.style.opacity = '1'
      avatarModal.style.visibility = 'visible'
      avatarModal.style.transform = 'translateY(0)'
    })

    // Hide modal on mouse leave with delay
    avatarContainer.addEventListener('mouseleave', function () {
      hoverTimeout = setTimeout(function () {
        avatarModal.style.opacity = '0'
        avatarModal.style.visibility = 'hidden'
        avatarModal.style.transform = 'translateY(-10px)'
      }, 150)
    })

    // Keep modal open when hovering over it
    avatarModal.addEventListener('mouseenter', function () {
      clearTimeout(hoverTimeout)
    })

    // Hide modal when leaving modal
    avatarModal.addEventListener('mouseleave', function () {
      avatarModal.style.opacity = '0'
      avatarModal.style.visibility = 'hidden'
      avatarModal.style.transform = 'translateY(-10px)'
    })

    // Handle modal menu item clicks
    const modalItems = document.querySelectorAll('.avatar-modal__item')
    modalItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault()
        const itemText = this.textContent.trim()

        switch (itemText) {
          case 'Thông tin cá nhân':
            window.location.href = '/users/profile'
            break
          case 'Bài viết đã lưu':
            alert('Tính năng bài viết đã lưu sẽ được tích hợp sau.')
            break
          case 'Lịch sử hoạt động':
            alert('Tính năng lịch sử hoạt động sẽ được tích hợp sau.')
            break
          case 'Đăng xuất':
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
              alert('Tính năng đăng xuất sẽ được tích hợp sau.')
            }
            break
          default:
            alert('Tính năng này sẽ được tích hợp sau.')
        }

        // Hide modal after click
        avatarModal.style.opacity = '0'
        avatarModal.style.visibility = 'hidden'
        avatarModal.style.transform = 'translateY(-10px)'
      })
    })
  }
})()

// Write-sentence setup interactions
;(function () {
  const levelOptions = document.querySelectorAll('.ws-setup__option')
  const topicButtons = document.querySelectorAll('.ws-setup__topic')
  const customTopicInput = document.querySelector('.ws-setup__custom-input')
  const startBtn = document.querySelector('.ws-setup__start')

  let selectedLevel = 'basic'
  let selectedTopic = 'random'

  levelOptions.forEach((opt) => {
    opt.addEventListener('click', function () {
      levelOptions.forEach((o) => o.classList.remove('ws-setup__option--active'))
      this.classList.add('ws-setup__option--active')
      selectedLevel = this.getAttribute('data-value')
    })
  })

  topicButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      topicButtons.forEach((b) => b.classList.remove('ws-setup__topic--active'))
      this.classList.add('ws-setup__topic--active')
      selectedTopic = this.getAttribute('data-topic')
    })
  })

  if (customTopicInput) {
    customTopicInput.addEventListener('input', function () {
      if (this.value.trim() !== '') {
        selectedTopic = 'custom'
        selectedTopicValue = this.value.trim()
      }
    })

    customTopicInput.addEventListener('focus', function () {
      topicButtons.forEach((b) => b.classList.remove('ws-setup__topic--active'))
    })
  }

  if (startBtn) {
    startBtn.addEventListener('click', function () {
      const params = new URLSearchParams({
        level: selectedLevel,
        topic: selectedTopic
      })

      if (selectedTopic === 'custom' && customTopicInput) {
        params.set('customTopic', customTopicInput.value.trim())
      }

      window.location.href = `/write-sentence/practice.html?${params.toString()}`
    })
  }
})()
// Write-sentence Setup
const levelWSOptions = document.querySelectorAll('.ws-setup__option--level')
const topicWSOptions = document.querySelectorAll('.ws-setup__topic')
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

// Write-paragraph Setup
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

// Hint Modal functionality
;(function () {
  const hintModal = document.getElementById('hintModal')
  const hintBtn = document.querySelector('.practice-actions__btn--hint')
  const closeBtn = document.getElementById('hintModalClose')

  if (!hintModal || !hintBtn) return

  // Open modal
  hintBtn.addEventListener('click', function () {
    hintModal.classList.add('show')
    document.body.style.overflow = 'hidden'
  })

  // Close modal functions
  function closeModal() {
    hintModal.classList.remove('show')
    document.body.style.overflow = ''
  }

  // Close button events
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal)
  }

  // Close on overlay click
  const overlay = hintModal.querySelector('.hint-modal__overlay')
  if (overlay) {
    overlay.addEventListener('click', closeModal)
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && hintModal.classList.contains('show')) {
      closeModal()
    }
  })

  // Add to list functionality
  const addBtns = hintModal.querySelectorAll('.hint-modal__add-btn')
  addBtns.forEach((btn) => {
    btn.addEventListener('click', function () {})
  })
})()

// Dictionary Modal functionality for write-paragraph
;(function () {
  const dictionaryModal = document.getElementById('dictionaryModal')
  const dictionaryBtn = document.querySelector('.btn-wp-dictionary')
  const closeBtn = document.getElementById('dictionaryModalClose')

  if (!dictionaryModal || !dictionaryBtn) return

  // Open modal
  dictionaryBtn.addEventListener('click', function () {
    dictionaryModal.classList.add('show')
    document.body.style.overflow = 'hidden'
  })

  // Close modal functions
  function closeModal() {
    dictionaryModal.classList.remove('show')
    document.body.style.overflow = ''
  }

  // Close button events
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal)
  }

  // Close on overlay click
  const overlay = dictionaryModal.querySelector('.hint-modal__overlay')
  if (overlay) {
    overlay.addEventListener('click', closeModal)
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dictionaryModal.classList.contains('show')) {
      closeModal()
    }
  })

  // Add to dictionary functionality
  const addBtns = dictionaryModal.querySelectorAll('.hint-modal__add-btn')
  addBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const word = this.closest('.hint-modal__item').querySelector('.hint-modal__hint-text').textContent
      alert(`Đã thêm từ "${word}" vào từ điển cá nhân!`)
    })
  })
})()
