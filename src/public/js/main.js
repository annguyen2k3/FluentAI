// Home page functionality
;(function () {
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
      sidebarSublinks.forEach((sl) =>
        sl.classList.remove('sidebar__sublink--active')
      )
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
      sidebarSublinks.forEach((sl) =>
        sl.classList.remove('sidebar__sublink--active')
      )

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
  }
})()

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
      const word = this.closest('.hint-modal__item').querySelector(
        '.hint-modal__hint-text'
      ).textContent
      alert(`Đã thêm từ "${word}" vào từ điển cá nhân!`)
    })
  })
})()

// Alert notification functions
window.alertSuccess = function (message, time = 3000) {
  const alertContainer = document.createElement('div')
  alertContainer.className = 'alert-notification alert-notification--success'
  alertContainer.innerHTML = `
    <i class="fas fa-check-circle alert-notification__icon"></i>
    <div class="alert-notification__content">${message}</div>
    <button type="button" class="alert-notification__close" aria-label="Đóng">
      <i class="fas fa-times"></i>
    </button>
  `

  document.body.appendChild(alertContainer)

  const closeBtn = alertContainer.querySelector('.alert-notification__close')
  const closeAlert = () => {
    alertContainer.classList.add('alert-notification--hide')
    setTimeout(() => {
      if (alertContainer.parentNode) {
        alertContainer.parentNode.removeChild(alertContainer)
      }
    }, 300)
  }

  closeBtn.addEventListener('click', closeAlert)

  if (time > 0) {
    setTimeout(closeAlert, time)
  }

  return alertContainer
}

window.alertError = function (message, time = 5000) {
  const alertContainer = document.createElement('div')
  alertContainer.className = 'alert-notification alert-notification--error'
  alertContainer.innerHTML = `
    <i class="fas fa-exclamation-circle alert-notification__icon"></i>
    <div class="alert-notification__content">${message}</div>
    <button type="button" class="alert-notification__close" aria-label="Đóng">
      <i class="fas fa-times"></i>
    </button>
  `

  document.body.appendChild(alertContainer)

  const closeBtn = alertContainer.querySelector('.alert-notification__close')
  const closeAlert = () => {
    alertContainer.classList.add('alert-notification--hide')
    setTimeout(() => {
      if (alertContainer.parentNode) {
        alertContainer.parentNode.removeChild(alertContainer)
      }
    }, 300)
  }

  closeBtn.addEventListener('click', closeAlert)

  if (time > 0) {
    setTimeout(closeAlert, time)
  }

  return alertContainer
}
;(function () {
  const dictionaryToggle = document.getElementById('dictionaryWidgetToggle')
  const dictionaryContainer = document.getElementById(
    'dictionaryWidgetContainer'
  )

  if (dictionaryToggle && dictionaryContainer) {
    dictionaryToggle.addEventListener('click', function () {
      dictionaryContainer.classList.toggle(
        'dictionary-widget__container--active'
      )
      dictionaryToggle.classList.toggle('dictionary-widget__toggle--active')
    })

    document.addEventListener('click', function (event) {
      const isClickInsideWidget = dictionaryContainer.contains(event.target)
      const isClickOnToggle = dictionaryToggle.contains(event.target)

      if (!isClickInsideWidget && !isClickOnToggle) {
        dictionaryContainer.classList.remove(
          'dictionary-widget__container--active'
        )
        dictionaryToggle.classList.remove('dictionary-widget__toggle--active')
      }
    })
  }
})()
