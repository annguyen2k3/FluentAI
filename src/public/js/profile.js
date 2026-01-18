import { ApiBreakpoint } from './api_breakpoint.js'
import {
  formatISOStringToDate,
  formatISOStringToDateInputValue,
  formatISOStringToDateTime
} from './helper.js'

// Profile page functionality
;(function () {
  // Check if we're on the profile page
  const formProfile = document.getElementById('profileForm')
  if (!formProfile) return

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

        const formData = new FormData()
        formData.append('images', file)

        // Upload avatar to server
        fetch(ApiBreakpoint.UPDATE_AVATAR_PROFILE, {
          method: 'PATCH',
          body: formData
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === 200) {
              avatarPreview.src = data.avatar_url
              alertSuccess(data.message)
            } else {
              alertError('Lỗi: ' + data.message)
            }
          })
          .catch((error) => {
            alertError('Lỗi Server: ' + error.message)
          })
      }
    })
  }

  // Toggle between view and edit mode
  const editBtn = document.getElementById('editBtn')
  const cancelBtn = document.getElementById('cancelBtn')
  const viewMode = document.getElementById('viewMode')
  const editMode = document.getElementById('editMode')
  const profileForm = document.getElementById('profileForm')

  const viewUsername = formProfile.querySelector('[viewUsername]')
  const viewEmail = formProfile.querySelector('[viewEmail]')
  const viewDateOfBirth = formProfile.querySelector('[viewDateOfBirth]')
  const viewPhoneNumber = formProfile.querySelector('[viewPhoneNumber]')
  const viewGender = formProfile.querySelector('[viewGender]')
  const viewUpdatedAt = formProfile.querySelector('[viewUpdatedAt]')

  const editUsername = formProfile.querySelector('[editUsername]')
  const editEmail = formProfile.querySelector('[editEmail]')
  const editDateOfBirth = formProfile.querySelector('[editDateOfBirth]')
  const editPhoneNumber = formProfile.querySelector('[editPhoneNumber]')
  const editGender = formProfile.querySelector('[editGender]')
  const editUpdatedAt = formProfile.querySelector('[editUpdatedAt]')

  let user = JSON.parse(formProfile.getAttribute('data-user'))

  function loadData() {
    if (viewUsername) viewUsername.textContent = user.username
    if (viewEmail) viewEmail.textContent = user.email
    if (viewDateOfBirth)
      viewDateOfBirth.textContent = formatISOStringToDate(user.date_of_birth)
    if (viewPhoneNumber) viewPhoneNumber.textContent = user.phone_number
    if (viewGender)
      viewGender.textContent =
        user.gender === 'male'
          ? 'Nam'
          : user.gender === 'female'
            ? 'Nữ'
            : 'Khác'
    if (viewUpdatedAt)
      viewUpdatedAt.textContent = formatISOStringToDateTime(user.update_at)

    if (editUsername) editUsername.value = user.username
    if (editEmail) editEmail.value = user.email
    if (editDateOfBirth)
      editDateOfBirth.value = formatISOStringToDateInputValue(
        user.date_of_birth
      )
    if (editPhoneNumber) editPhoneNumber.value = user.phone_number
    if (editGender) {
      const selected = editGender.querySelector(
        `option[value="${user.gender}"]`
      )
      if (selected) {
        selected.setAttribute('selected', 'true')
      }
    } else {
      editGender
        .querySelector('option[value=""]')
        .setAttribute('selected', 'true')
    }
    if (editUpdatedAt)
      editUpdatedAt.textContent = formatISOStringToDateTime(user.update_at)
  }

  loadData()

  function enterEditMode() {
    // Show edit mode, hide view mode
    viewMode.classList.add('hidden')
    editMode.classList.add('active')
  }

  function exitEditMode() {
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
      const username = editUsername.value.trim()
      const dateOfBirth = editDateOfBirth.value
      const phone = editPhoneNumber.value.trim()
      const gender = editGender.value


      // Normalize data for API
      const isoDateOfBirth = new Date(dateOfBirth).toISOString()

      // Send data to server
      fetch(ApiBreakpoint.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          dateOfBirth: isoDateOfBirth,
          phoneNumber: phone,
          gender: gender
        })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 200) {
            alertSuccess('Cập nhật thông tin thành công!')
            user = data.user
            loadData()
            exitEditMode()
          } else if (data.status === 422) {
            const errors = data.errors
            for (const key in errors) {
              const errorElement = profileForm.querySelector(
                `.invalid-feedback[error="${key}"]`
              )
              if (errorElement) {
                const errorItem = errors[key]
                errorElement.textContent = errorItem.msg
                errorElement.style.display = 'block'
              }
            }
          }
        })
        .catch((error) => {
          alertError('Lỗi Server: ' + error.message)
        })
    })
  }

  // Password form functionality
  const passwordForm = document.getElementById('passwordForm')

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

  // Handle password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault()

      const errors = passwordForm.querySelectorAll('.invalid-feedback')
      errors.forEach((error) => {
        error.style.display = 'none'
      })

      const oldPassword = document.getElementById('oldPassword').value.trim()
      const newPassword = document.getElementById('newPassword').value.trim()
      const confirmPassword = document
        .getElementById('confirmPassword')
        .value.trim()

      fetch(ApiBreakpoint.CHANGE_PASSWORD, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 200) {
            alertSuccess(data.message)
            passwordForm.reset()
          } else if (data.status === 422) {
            const errors = data.errors
            for (const key in errors) {
              const errorElement = passwordForm.querySelector(
                `.invalid-feedback[error="${key}"]`
              )
              if (errorElement) {
                const errorItem = errors[key]
                errorElement.textContent = errorItem.msg
                errorElement.style.display = 'block'
              }
            }
          }
        })
    })

    const resetBtn = passwordForm.querySelector('button[type="reset"]')
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        passwordForm.reset()
        const errors = passwordForm.querySelectorAll('.invalid-feedback')
        errors.forEach((error) => {
          error.style.display = 'none'
        })
      })
    }
  }
})()
