// Custom JavaScript for FAdmin

const prefixAdmin = '/admin'

// Sidebar and Navigation Handling

document.addEventListener('DOMContentLoaded', function () {
  // Initialize sidebar toggle
  initializeSidebarToggle()

  // Initialize sidebar active states
  initializeSidebarActive()

  // Initialize tooltips
  initializeTooltips()

  // Initialize dropdowns
  initializeDropdowns()
})

// Sidebar toggle functionality
function initializeSidebarToggle() {
  const toggleButtons = document.querySelectorAll('.toggle-sidebar, .sidenav-toggler')
  const sidebar = document.querySelector('.sidebar')
  const mainPanel = document.querySelector('.main-panel')

  toggleButtons.forEach((button) => {
    button.addEventListener('click', function () {
      sidebar.classList.toggle('active')
      mainPanel.classList.toggle('active')
    })
  })
}

// Sidebar active state management
function initializeSidebarActive() {
  const currentPath = window.location.pathname
  const currentPage = currentPath.split('/').pop()

  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active')
  })

  // Add active class to current page
  const navLinks = {
    'index.html': 'a[href="index.html"], a[href="/admin/index.html"]',
    'users.html': 'a[href="users.html"], a[href="/admin/users.html"]',
    'scores.html': 'a[href="scores.html"], a[href="/admin/scores.html"]'
  }

  if (navLinks[currentPage]) {
    const activeLink = document.querySelector(navLinks[currentPage])
    if (activeLink) {
      activeLink.parentElement.classList.add('active')
    }
  }
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}

// Initialize Bootstrap dropdowns
function initializeDropdowns() {
  const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
  dropdownElementList.map(function (dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl)
  })
}

// Utility function to show notifications
function showNotification(type, message, duration = 3000) {
  if (typeof swal !== 'undefined') {
    swal({
      title: type === 'success' ? 'Thành công!' : type === 'error' ? 'Lỗi!' : 'Thông báo',
      text: message,
      icon: type,
      button: 'OK'
    })
  } else {
    // Fallback to Bootstrap alert
    const notification = document.createElement('div')
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    // Add to body
    document.body.appendChild(notification)

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, duration)
  }
}

// Utility function to format numbers
function formatNumber(num) {
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Utility function to format date
function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

// Utility function to format datetime
function formatDateTime(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Export functions for global use
window.FAdmin = {
  showNotification,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime
}
