import { ApiBreakpoint } from './api_breakpoint.js'

// Login form validation
;(function () {
  const form = document.getElementById('loginForm')
  const btnLogin = document.querySelector('button[btn-submit-login]')

  if (!form) return

  if (btnLogin) {
    btnLogin.addEventListener('click', function (event) {
      event.preventDefault()
      const email = form.querySelector('input#email').value
      const password = form.querySelector('input#password').value

      document.querySelectorAll('.invalid-feedback').forEach((element) => {
        element.style.display = 'none'
      })

      fetch(ApiBreakpoint.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          if (data.status === 200) {
            window.location.href = '/'
          } else if (data.status === 422) {
            const errors = data.errors
            for (const key in errors) {
              const errorElement = form.querySelector(`.invalid-feedback[error="${key}"]`)
              if (errorElement) {
                const errorItem = errors[key]
                errorElement.textContent = errorItem.msg
                errorElement.style.display = 'block'
              }
            }
          }
        })
        .catch((error) => console.error('Error:', error))
    })
  }
})()

// Google OAuth login
;(function () {
  const btnGoogle = document.getElementById('btnGoogle')
  if (btnGoogle) {
    btnGoogle.addEventListener('click', function () {
      window.location.href = '/users/oauth/google'
    })
  }
})()

// Register form validation
;(function () {
  const form = document.getElementById('registerForm')
  if (!form) return

  const btnRegister = form.querySelector('button[btn-submit-register]')
  btnRegister.addEventListener('click', function (event) {
    event.preventDefault()

    const email = form.querySelector('input#regEmail').value
    const password = form.querySelector('input#regPassword').value
    const passwordConfirm = form.querySelector('input#regPasswordConfirm').value

    document.querySelectorAll('.invalid-feedback').forEach((element) => {
      element.style.display = 'none'
    })

    fetch(ApiBreakpoint.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ email, password, passwordConfirm })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.status === 200) {
          document.cookie = `emailRegister=${encodeURIComponent(email)}; Path=/; Max-Age=900; SameSite=Lax`
          document.cookie = `passwordRegister=${encodeURIComponent(password)}; Path=/; Max-Age=900; SameSite=Lax`

          window.location.href = `/users/verify-email`
        } else if (data.status === 422) {
          const errors = data.errors
          for (const key in errors) {
            const errorElement = form.querySelector(`.invalid-feedback[error="${key}"]`)
            if (errorElement) {
              const errorItem = errors[key]
              errorElement.textContent = errorItem.msg
              errorElement.style.display = 'block'
            }
          }
        }
      })
      .catch((error) => console.error('Error:', error))
  })
})()

// // Forgot password form validation
// ;(function () {
//   const form = document.getElementById('forgotForm')
//   if (!form) return

//   form.addEventListener('submit', function (event) {
//     if (!form.checkValidity()) {
//       event.preventDefault()
//       event.stopPropagation()
//     }
//     form.classList.add('was-validated')
//   })
// })()

// // Reset password form validation
// ;(function () {
//   const form = document.getElementById('resetForm')
//   if (!form) return
//   const pass = document.getElementById('newPassword')
//   const pass2 = document.getElementById('confirmNewPassword')

//   function validateMatch() {
//     if (pass2.value && pass.value !== pass2.value) {
//       pass2.setCustomValidity('Mismatch')
//     } else {
//       pass2.setCustomValidity('')
//     }
//   }

//   pass.addEventListener('input', validateMatch)
//   pass2.addEventListener('input', validateMatch)

//   form.addEventListener('submit', function (e) {
//     validateMatch()
//     if (!form.checkValidity()) {
//       e.preventDefault()
//       e.stopPropagation()
//     }
//     form.classList.add('was-validated')
//   })
// })()

// Verify email form validation
;(function () {
  const form = document.getElementById('verifyForm')
  const inputs = [
    document.getElementById('verifyCode1'),
    document.getElementById('verifyCode2'),
    document.getElementById('verifyCode3'),
    document.getElementById('verifyCode4')
  ]
  const btnResend = document.getElementById('btnResendEmail')
  const resendText = document.getElementById('resendText')
  const countdownText = document.getElementById('countdownText')
  const countdownNumber = document.getElementById('countdownNumber')

  function getFullCode() {
    return inputs.map((input) => input.value).join('')
  }

  function validateCode() {
    const code = getFullCode()
    return /^\d{4}$/.test(code)
  }

  function moveToNext(currentIndex) {
    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus()
    }
  }

  function moveToPrevious(currentIndex) {
    if (currentIndex > 0) {
      inputs[currentIndex - 1].focus()
    }
  }

  inputs.forEach((input, index) => {
    input.addEventListener('input', function (e) {
      const value = this.value.replace(/\D/g, '')
      this.value = value

      if (value && index < inputs.length - 1) {
        moveToNext(index)
      }
    })

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && index > 0) {
        moveToPrevious(index)
      } else if (e.key === 'ArrowLeft' && index > 0) {
        moveToPrevious(index)
      } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
        moveToNext(index)
      }
    })

    input.addEventListener('paste', function (e) {
      e.preventDefault()
      const pastedData = (e.clipboardData || window.clipboardData).getData('text')
      const digits = pastedData.replace(/\D/g, '').slice(0, 4)

      for (let i = 0; i < digits.length && index + i < inputs.length; i++) {
        inputs[index + i].value = digits[i]
      }

      if (digits.length > 0) {
        inputs[Math.min(index + digits.length - 1, inputs.length - 1)].focus()
      }
    })
  })

  form.addEventListener('submit', function (event) {
    event.preventDefault()
    event.stopPropagation()
    if (!validateCode()) {
      form.querySelector('.invalid-feedback[error="otp"]').style.display = 'block'
    } else {
      const otp = getFullCode()
      fetch(ApiBreakpoint.VERIFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ otp })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          if (data.status === 200) {
            window.location.href = '/'
          } else if (data.status === 422) {
            const errors = data.errors
            for (const key in errors) {
              const errorElement = form.querySelector(`.invalid-feedback[error="${key}"]`)
              if (errorElement) {
                const errorItem = errors[key]
                errorElement.textContent = errorItem.msg
                errorElement.style.display = 'block'
              }
            }
          }
        })
        .catch((error) => console.error('Error:', error))
    }
  })

  // Countdown để gửi lại email xác thực
  let countdown = 30
  let countdownInterval = null

  function startCountdown() {
    countdown = 30
    btnResend.disabled = true
    resendText.classList.add('d-none')
    countdownText.classList.remove('d-none')

    countdownInterval = setInterval(function () {
      countdown--
      countdownNumber.textContent = countdown

      if (countdown <= 0) {
        clearInterval(countdownInterval)
        btnResend.disabled = false
        resendText.classList.remove('d-none')
        countdownText.classList.add('d-none')
      }
    }, 1000)
  }

  // Gửi lại email xác thực
  btnResend.addEventListener('click', function () {
    if (!btnResend.disabled) {
      window.location.href = '/users/verify-email'
    }
  })

  startCountdown()
  inputs[0].focus()
})()
