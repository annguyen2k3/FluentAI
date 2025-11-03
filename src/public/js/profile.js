// Profile page functionality
;(function () {
  // Check if we're on the profile page
  if (!document.getElementById('profileForm')) return

  // Avatar preview functionality
  const avatarInput = document.getElementById('avatarInput')
  const avatarPreview = document.getElementById('avatarPreview')

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', function (e) {
      const file = e.target.files[0]
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Vui lòng chọn một file ảnh hợp lệ.')
          return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Kích thước ảnh không được vượt quá 5MB.')
          return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = function (e) {
          avatarPreview.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Toggle between view and edit mode
  const editBtn = document.getElementById('editBtn')
  const cancelBtn = document.getElementById('cancelBtn')
  const viewMode = document.getElementById('viewMode')
  const editMode = document.getElementById('editMode')
  const profileForm = document.getElementById('profileForm')

  // Store original values
  let originalValues = {}

  function enterEditMode() {
    // Save original values
    originalValues = {
      username: document.getElementById('username').value,
      dateOfBirth: document.getElementById('dateOfBirth').value,
      phone: document.getElementById('phone').value,
      gender: document.getElementById('gender').value
    }

    // Show edit mode, hide view mode
    viewMode.classList.add('hidden')
    editMode.classList.add('active')
  }

  function exitEditMode() {
    // Restore original values
    if (Object.keys(originalValues).length > 0) {
      document.getElementById('username').value = originalValues.username
      document.getElementById('dateOfBirth').value = originalValues.dateOfBirth
      document.getElementById('phone').value = originalValues.phone
      document.getElementById('gender').value = originalValues.gender
    }

    // Show view mode, hide edit mode
    viewMode.classList.remove('hidden')
    editMode.classList.remove('active')
  }

  if (editBtn) {
    editBtn.addEventListener('click', enterEditMode)
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', exitEditMode)
  }

  // Handle profile form submission
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault()

      // Get form values
      const username = document.getElementById('username').value.trim()
      const dateOfBirth = document.getElementById('dateOfBirth').value
      const phone = document.getElementById('phone').value.trim()
      const gender = document.getElementById('gender').value

      // Validation
      if (!username || !dateOfBirth || !phone || !gender) {
        alert('Vui lòng điền đầy đủ thông tin.')
        return
      }

      // Format date for display
      const formattedDate = formatDate(dateOfBirth)

      // Update view mode values
      document.getElementById('viewUsername').textContent = username
      document.getElementById('viewDateOfBirth').textContent = formattedDate
      document.getElementById('viewPhone').textContent = phone
      document.getElementById('viewGender').textContent = gender

      // Update updated date
      const now = new Date()
      const updatedAt = formatDateTime(now)
      document.getElementById('viewUpdatedAt').textContent = updatedAt
      document.getElementById('editUpdatedAt').textContent = updatedAt

      // Save new values as original
      originalValues = {
        username: username,
        dateOfBirth: dateOfBirth,
        phone: phone,
        gender: gender
      }

      // Exit edit mode
      exitEditMode()

      // Show success message
      alert('Cập nhật thông tin thành công!')

      // Here you would typically send the data to the server
      // Example: await updateProfile({ username, dateOfBirth, phone, gender });
    })
  }

  // Password form functionality
  const passwordForm = document.getElementById('passwordForm')
  const passwordMismatch = document.getElementById('passwordMismatch')

  // Password toggle visibility
  const passwordToggles = document.querySelectorAll('.password-form__toggle')
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const targetId = this.getAttribute('data-toggle')
      const input = document.getElementById(targetId)
      const icon = this.querySelector('i')

      if (input.type === 'password') {
        input.type = 'text'
        icon.classList.remove('fa-eye')
        icon.classList.add('fa-eye-slash')
      } else {
        input.type = 'password'
        icon.classList.remove('fa-eye-slash')
        icon.classList.add('fa-eye')
      }
    })
  })

  // Validate password match on input
  const newPasswordInput = document.getElementById('newPassword')
  const confirmPasswordInput = document.getElementById('confirmPassword')

  function validatePasswordMatch() {
    if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.setCustomValidity('Mật khẩu không khớp')
      passwordMismatch.style.display = 'block'
      confirmPasswordInput.classList.add('is-invalid')
    } else {
      confirmPasswordInput.setCustomValidity('')
      passwordMismatch.style.display = 'none'
      confirmPasswordInput.classList.remove('is-invalid')
    }
  }

  if (newPasswordInput && confirmPasswordInput) {
    newPasswordInput.addEventListener('input', validatePasswordMatch)
    confirmPasswordInput.addEventListener('input', validatePasswordMatch)
  }

  // Handle password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault()

      const oldPassword = document.getElementById('oldPassword').value
      const newPassword = document.getElementById('newPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value

      // Validation
      if (!oldPassword || !newPassword || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin.')
        return
      }

      if (newPassword.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự.')
        return
      }

      if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới và xác nhận mật khẩu không khớp.')
        return
      }

      // Show success message
      alert('Đổi mật khẩu thành công!')

      // Reset form
      passwordForm.reset()

      // Here you would typically send the data to the server
      // Example: await changePassword({ oldPassword, newPassword });
    })
  }

  // Helper functions
  function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  function formatDateTime(date) {
    if (!date) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
})()
